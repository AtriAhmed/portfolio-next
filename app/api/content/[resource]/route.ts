import mongoose, { type Model } from "mongoose";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import {
  AboutModel, ContactModel, EducationModel, ExperienceModel, SiteSettingsModel, SkillModel, TypeModel, WorkModel,
} from "@/lib/models";
import { deleteManagedUpload, saveUploadedImage } from "@/lib/uploads";
import { ensureSiteSettings } from "@/lib/site-settings-data";

export const runtime = "nodejs";

const models: Record<string, Model<unknown>> = {
  about: AboutModel,
  contact: ContactModel,
  education: EducationModel,
  experiences: ExperienceModel,
  skills: SkillModel,
  settings: SiteSettingsModel,
  types: TypeModel,
  work: WorkModel,
};
const singletonResources = new Set(["contact", "education", "settings"]);
const allowedFields: Record<string, string[]> = {
  about: ["title", "content", "order", "isVisible"],
  contact: ["name", "lastname", "title", "summary", "email", "phone", "location", "github", "linkedin", "website", "image"],
  education: ["certificate", "institute", "date", "location"],
  experiences: ["name", "position", "date", "description", "image", "showInCV", "order", "isVisible"],
  skills: ["name", "level", "type", "order", "isVisible"],
  settings: [
    "siteTitle", "siteDescription", "heroEyebrow", "heroCtaLabel", "heroCtaHref", "portraitLabelPrefix",
    "navAboutLabel", "navExperienceLabel", "navWorkLabel", "navSkillsLabel", "navContactLabel", "navCvLabel",
    "experienceKicker", "experienceTitle", "workKicker", "workTitle", "skillsKicker", "skillsTitle",
    "contactKicker", "contactTitle", "contactFallbackText", "formNameLabel", "formEmailLabel", "formSubjectLabel", "formMessageLabel",
    "formSubmitLabel", "formSendingLabel", "formSuccessTitle", "formSuccessMessage", "formErrorTitle", "formErrorMessage",
    "cvKicker", "cvTitle", "cvContactHeading", "cvEducationHeading", "cvLinksHeading", "cvExperienceHeading", "cvProjectsHeading",
    "cvSkillsHeading", "cvDownloadLabel", "footerText", "showExperience", "showWork", "showSkills", "showContact", "showCv",
  ],
  types: ["name", "order", "isVisible"],
  work: ["name", "description", "technologies", "image", "link", "showInCV", "order", "isVisible"],
};

async function resourceContext(params: Promise<{ resource: string }>) {
  const { resource } = await params;
  const model = models[resource];
  if (!model) return null;
  return { resource, model };
}

function cleanData(resource: string, input: Record<string, unknown>) {
  return Object.fromEntries(
    allowedFields[resource]
      .filter((field) => input[field] !== undefined)
      .map((field) => [field, input[field]]),
  );
}

async function parseBody(request: Request, resource: string) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return cleanData(resource, await request.json());
  }
  const form = await request.formData();
  const input: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    if (key !== "image") input[key] = value === "true" ? true : value === "false" ? false : value;
  }
  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    input.image = await saveUploadedImage(image);
  }
  return cleanData(resource, input);
}

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    await requireSession();
    const context = await resourceContext(params);
    if (!context) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    if (context.resource === "settings") return NextResponse.json(await ensureSiteSettings());
    await connectDb();
    const query = singletonResources.has(context.resource) ? context.model.findOne() : context.model.find().sort({ order: 1, _id: 1 });
    const data = await query.lean();
    return NextResponse.json(data);
  } catch (error) {
    return contentError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  let uploadedImage: string | undefined;
  try {
    await requireSession();
    const context = await resourceContext(params);
    if (!context) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    await connectDb();
    const data = await parseBody(request, context.resource);
    uploadedImage = imageFromRecord(data);
    const record = singletonResources.has(context.resource)
      ? await context.model.findOneAndUpdate({}, data, { new: true, upsert: true })
      : await context.model.create(data);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (uploadedImage) await deleteImageIfUnreferenced(uploadedImage);
    return contentError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  let uploadedImage: string | undefined;
  try {
    await requireSession();
    const context = await resourceContext(params);
    if (!context) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    await connectDb();
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "Invalid record id." }, { status: 400 });
    const previousRecord = await context.model.findById(id).lean();
    if (!previousRecord) return NextResponse.json({ message: "Record not found." }, { status: 404 });

    const input = await parseBody(request, context.resource);
    uploadedImage = imageFromRecord(input);
    const record = await context.model.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!record) {
      if (uploadedImage) await deleteManagedUpload(uploadedImage);
      return NextResponse.json({ message: "Record not found." }, { status: 404 });
    }

    const previousImage = imageFromRecord(previousRecord);
    if (uploadedImage && previousImage && previousImage !== uploadedImage) {
      await deleteImageIfUnreferenced(previousImage);
    }
    return NextResponse.json(record);
  } catch (error) {
    if (uploadedImage) await deleteImageIfUnreferenced(uploadedImage);
    return contentError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    await requireSession();
    const context = await resourceContext(params);
    if (!context) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ message: "Invalid record id." }, { status: 400 });
    await connectDb();
    if (context.resource === "types") {
      const referencedSkills = await SkillModel.countDocuments({ type: id });
      if (referencedSkills > 0) {
        return NextResponse.json(
          { message: `This skill type is used by ${referencedSkills} ${referencedSkills === 1 ? "skill" : "skills"}. Move or delete them first.` },
          { status: 409 },
        );
      }
    }
    const record = await context.model.findByIdAndDelete(id);
    const image = imageFromRecord(record);
    if (image) await deleteImageIfUnreferenced(image);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return contentError(error);
  }
}

function imageFromRecord(record: unknown) {
  if (!record || typeof record !== "object" || !("image" in record)) return undefined;
  const image = (record as { image?: unknown }).image;
  return typeof image === "string" && image ? image : undefined;
}

async function deleteImageIfUnreferenced(image: string) {
  try {
    const [experienceUsesImage, workUsesImage, contactUsesImage] = await Promise.all([
    ExperienceModel.exists({ image }),
    WorkModel.exists({ image }),
    ContactModel.exists({ image }),
  ]);
    if (!experienceUsesImage && !workUsesImage && !contactUsesImage) await deleteManagedUpload(image);
  } catch (error) {
    console.error("Could not determine whether an upload is still in use", { image, error });
  }
}

function contentError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }
  if (error instanceof Error && error.message === "INVALID_IMAGE") {
    return NextResponse.json({ message: "Upload an image smaller than 5 MB." }, { status: 400 });
  }
  console.error("Content request failed", error);
  return NextResponse.json({ message: "The request could not be completed." }, { status: 500 });
}
