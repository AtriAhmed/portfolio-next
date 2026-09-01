import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  cleanResourceData,
  countRecords,
  createRecord,
  deleteRecord,
  findRecord,
  firstRecord,
  isResourceName,
  listRecords,
  recordExists,
  resources,
  updateRecord,
  upsertSingleton,
  type ResourceName,
} from "@/lib/content-repository";
import { deleteManagedUpload, importImageFromUrl, saveUploadedImage, saveUploadedPdf } from "@/lib/uploads";
import { ensureSiteSettings } from "@/lib/site-settings-data";
import { deleteTranslations, localizeRecord, localizeRecords, translationData, translationUsesAsset, upsertTranslation } from "@/lib/content-i18n";
import { routing, type AppLocale } from "@/i18n/routing";

export const runtime = "nodejs";

async function resourceFrom(params: Promise<{ resource: string }>) {
  const { resource } = await params;
  return isResourceName(resource) ? resource : null;
}

async function parseBody(request: Request, resource: ResourceName) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return cleanResourceData(resource, await request.json());
  }

  const form = await request.formData();
  const input: Record<string, unknown> = {};
  const savedAssets: string[] = [];
  const acceptsImage = resources[resource].fields.includes("image");
  const acceptsPdf = resources[resource].fields.includes("cv");
  for (const [key, value] of form.entries()) {
    if (key !== "image" && key !== "imageUrl" && key !== "cv") input[key] = value === "true" ? true : value === "false" ? false : value;
  }
  try {
    const image = form.get("image");
    const imageUrl = form.get("imageUrl");
    if (acceptsImage && image instanceof File && image.size > 0 && typeof imageUrl === "string" && imageUrl.trim()) {
      throw new Error("IMAGE_SOURCE_CONFLICT");
    }
    if (acceptsImage && image instanceof File && image.size > 0) {
      input.image = await saveUploadedImage(image);
      savedAssets.push(String(input.image));
    } else if (acceptsImage && typeof imageUrl === "string" && imageUrl.trim()) {
      input.image = await importImageFromUrl(imageUrl);
      savedAssets.push(String(input.image));
    }
    const cv = form.get("cv");
    if (acceptsPdf && cv instanceof File && cv.size > 0) {
      input.cv = await saveUploadedPdf(cv);
      savedAssets.push(String(input.cv));
    }
    return cleanResourceData(resource, input);
  } catch (error) {
    await Promise.all(savedAssets.map(deleteManagedUpload));
    throw error;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    await requireSession();
    const resource = await resourceFrom(params);
    if (!resource) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    const locale = requestLocale(request);
    if (resource === "settings") {
      const settings = await ensureSiteSettings();
      return NextResponse.json(await localizeRecord("settings", settings as never, locale));
    }
    const data = resources[resource].singleton ? await firstRecord(resource) : await listRecords(resource);
    return NextResponse.json(Array.isArray(data) ? await localizeRecords(resource, data, locale) : await localizeRecord(resource, data, locale));
  } catch (error) {
    return contentError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  let uploadedAssets: string[] = [];
  try {
    await requireSession();
    const resource = await resourceFrom(params);
    if (!resource) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    if (requestLocale(request) !== "en") return NextResponse.json({ message: "Create records in English before adding a translation." }, { status: 400 });
    const previousRecord = resources[resource].singleton ? await firstRecord(resource) : null;
    const data = await parseBody(request, resource);
    uploadedAssets = assetsFromRecord(data);
    const record = resources[resource].singleton
      ? await upsertSingleton(resource, data)
      : await createRecord(resource, data);
    await deleteReplacedAssets(previousRecord, record);
    revalidatePortfolio();
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    await Promise.all(uploadedAssets.map(deleteAssetIfUnreferenced));
    return contentError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  let uploadedAssets: string[] = [];
  try {
    await requireSession();
    const resource = await resourceFrom(params);
    if (!resource) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!isUuid(id)) return NextResponse.json({ message: "Invalid record id." }, { status: 400 });
    const previousRecord = await findRecord(resource, id);
    if (!previousRecord) return NextResponse.json({ message: "Record not found." }, { status: 404 });

    const input = await parseBody(request, resource);
    const locale = requestLocale(request);
    if (locale !== "en") {
      const previousTranslation = await translationData(resource, id, locale);
      uploadedAssets = assetsFromRecord(input);
      const translation = await upsertTranslation(resource, id, locale, input);
      await deleteReplacedAssets(previousTranslation, translation);
      revalidatePortfolio();
      return NextResponse.json({ ...previousRecord, ...translation });
    }
    uploadedAssets = assetsFromRecord(input);
    const record = await updateRecord(resource, id, input);
    if (!record) {
      await Promise.all(uploadedAssets.map(deleteManagedUpload));
      return NextResponse.json({ message: "Record not found." }, { status: 404 });
    }

    await deleteReplacedAssets(previousRecord, record);
    revalidatePortfolio();
    return NextResponse.json(record);
  } catch (error) {
    await Promise.all(uploadedAssets.map(deleteAssetIfUnreferenced));
    return contentError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    await requireSession();
    const resource = await resourceFrom(params);
    if (!resource) return NextResponse.json({ message: "Unknown resource." }, { status: 404 });
    const id = new URL(request.url).searchParams.get("id") ?? "";
    if (!isUuid(id)) return NextResponse.json({ message: "Invalid record id." }, { status: 400 });
    if (resource === "types") {
      const referencedSkills = await countRecords("skills", { field: "type", value: id });
      if (referencedSkills > 0) {
        return NextResponse.json(
          { message: `This skill type is used by ${referencedSkills} ${referencedSkills === 1 ? "skill" : "skills"}. Move or delete them first.` },
          { status: 409 },
        );
      }
    }
    const record = await deleteRecord(resource, id);
    if (!record) return NextResponse.json({ message: "Record not found." }, { status: 404 });
    const translations = await deleteTranslations(resource, id);
    await Promise.all([...assetsFromRecord(record), ...translations.flatMap(assetsFromRecord)].map(deleteAssetIfUnreferenced));
    revalidatePortfolio();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return contentError(error);
  }
}

function assetsFromRecord(record: unknown) {
  if (!record || typeof record !== "object") return [];
  return ["image", "cv"].flatMap((field) => {
    const value = (record as Record<string, unknown>)[field];
    return typeof value === "string" && value ? [value] : [];
  });
}

async function deleteReplacedAssets(previousRecord: unknown, currentRecord: unknown) {
  const currentAssets = new Set(assetsFromRecord(currentRecord));
  await Promise.all(assetsFromRecord(previousRecord).filter((asset) => !currentAssets.has(asset)).map(deleteAssetIfUnreferenced));
}

async function deleteAssetIfUnreferenced(asset: string) {
  try {
    const usesAsset = await Promise.all([
      recordExists("experiences", "image", asset),
      recordExists("work", "image", asset),
      recordExists("contact", "image", asset),
      recordExists("contact", "cv", asset),
      translationUsesAsset(asset),
    ]);
    if (!usesAsset.some(Boolean)) await deleteManagedUpload(asset);
  } catch (error) {
    console.error("Could not determine whether an upload is still in use", { asset, error });
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function revalidatePortfolio() {
  revalidateTag("portfolio-data", "max");
}

function requestLocale(request: Request): AppLocale {
  const locale = new URL(request.url).searchParams.get("locale");
  return routing.locales.includes(locale as AppLocale) ? locale as AppLocale : "en";
}

function contentError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }
  if (error instanceof Error && error.message === "INVALID_IMAGE") {
    return NextResponse.json({ message: "Upload an image smaller than 5 MB." }, { status: 400 });
  }
  if (error instanceof Error && error.message === "INVALID_IMAGE_URL") {
    return NextResponse.json({ message: "Import a publicly accessible JPG, PNG, WebP, GIF, or AVIF image smaller than 5 MB." }, { status: 400 });
  }
  if (error instanceof Error && error.message === "IMAGE_SOURCE_CONFLICT") {
    return NextResponse.json({ message: "Choose either an image upload or an image URL, not both." }, { status: 400 });
  }
  if (error instanceof Error && error.message === "INVALID_PDF") {
    return NextResponse.json({ message: "Upload a valid PDF smaller than 10 MB." }, { status: 400 });
  }
  if (isPostgresError(error, "22P02") || isPostgresError(error, "23502")) {
    return NextResponse.json({ message: "One or more fields contain invalid data." }, { status: 400 });
  }
  if (isPostgresError(error, "23503")) {
    return NextResponse.json({ message: "This record is still referenced by other content." }, { status: 409 });
  }
  console.error("Content request failed", error);
  return NextResponse.json({ message: "The request could not be completed." }, { status: 500 });
}

function isPostgresError(error: unknown, code: string) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === code);
}
