import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { contactMessageSchemaFor } from "@/lib/contact-schema";
import { consumeRateLimit, rateLimitHeaders, requestIdentifier } from "@/lib/rate-limit";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]!);
}

export async function POST(request: Request) {
  const locale = request.headers.get("accept-language");
  const isArabic = locale?.toLowerCase().startsWith("ar") ?? false;
  const isTurkish = locale?.toLowerCase().startsWith("tr") ?? false;
  const localizedMessage = (english: string, arabic: string, turkish: string) => isArabic ? arabic : isTurkish ? turkish : english;

  try {
    const limit = await consumeRateLimit({
      namespace: "contact-ip",
      identifier: requestIdentifier(request),
      limit: 5,
      windowMs: 60 * 60_000,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { message: localizedMessage("Too many messages have been submitted. Please try again later.", "تم إرسال عدد كبير من الرسائل. يرجى المحاولة لاحقاً.", "Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyin.") },
        { status: 429, headers: rateLimitHeaders(limit) },
      );
    }
    const data = contactMessageSchemaFor(locale).parse(await request.json());
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
      return NextResponse.json({ message: error.issues[0]?.message ?? localizedMessage("Invalid message.", "بيانات الرسالة غير صالحة.", "Mesaj bilgileri geçersiz.") }, { status: 400 });
    }
    console.error("Contact email failed", error);
    return NextResponse.json({ message: localizedMessage("The message could not be sent right now.", "تعذر إرسال الرسالة حالياً.", "Mesaj şu anda gönderilemedi.") }, { status: 500 });
  }
}
