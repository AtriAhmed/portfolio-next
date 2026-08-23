import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactMessageSchema } from "@/lib/contact-schema";
import { consumeRateLimit, rateLimitHeaders, requestIdentifier } from "@/lib/rate-limit";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]!);
}

export async function POST(request: Request) {
  try {
    const limit = await consumeRateLimit({
      namespace: "contact-ip",
      identifier: requestIdentifier(request),
      limit: 5,
      windowMs: 60 * 60_000,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { message: "Too many messages have been submitted. Please try again later." },
        { status: 429, headers: rateLimitHeaders(limit) },
      );
    }
    const data = contactMessageSchema.parse(await request.json());
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT ?? 465),
      secure: Number(process.env.MAIL_PORT ?? 465) === 465,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD },
    });
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO ?? process.env.MAIL_USER,
      replyTo: data.email,
      subject: data.subject,
      html: `<p><strong>Name:</strong> ${escapeHtml(data.name)}</p><p><strong>Email:</strong> ${escapeHtml(data.email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>`,
    });
    return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(limit) });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Invalid message." }, { status: 400 });
    }
    console.error("Contact email failed", error);
    return NextResponse.json({ message: "The message could not be sent right now." }, { status: 500 });
  }
}
