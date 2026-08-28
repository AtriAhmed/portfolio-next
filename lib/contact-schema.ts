import { z } from "zod";

type ValidationMessages = Record<"nameMin" | "nameMax" | "emailRequired" | "emailInvalid" | "emailMax" | "subjectMin" | "subjectMax" | "messageMin" | "messageMax", string>;

const englishMessages: ValidationMessages = {
  nameMin: "Please enter at least 2 characters.", nameMax: "Name must be 100 characters or fewer.",
  emailRequired: "Please enter your email address.", emailInvalid: "Please enter a valid email address.", emailMax: "Email must be 200 characters or fewer.",
  subjectMin: "Please enter a subject.", subjectMax: "Subject must be 160 characters or fewer.",
  messageMin: "Please enter at least 10 characters.", messageMax: "Message must be 5,000 characters or fewer.",
};

const arabicMessages: ValidationMessages = {
  nameMin: "يرجى إدخال حرفين على الأقل.", nameMax: "يجب ألا يتجاوز الاسم 100 حرف.",
  emailRequired: "يرجى إدخال البريد الإلكتروني.", emailInvalid: "يرجى إدخال بريد إلكتروني صحيح.", emailMax: "يجب ألا يتجاوز البريد الإلكتروني 200 حرف.",
  subjectMin: "يرجى إدخال موضوع الرسالة.", subjectMax: "يجب ألا يتجاوز الموضوع 160 حرفاً.",
  messageMin: "يرجى إدخال 10 أحرف على الأقل.", messageMax: "يجب ألا تتجاوز الرسالة 5000 حرف.",
};

const turkishMessages: ValidationMessages = {
  nameMin: "Lütfen en az 2 karakter girin.", nameMax: "Ad en fazla 100 karakter olabilir.",
  emailRequired: "Lütfen e-posta adresinizi girin.", emailInvalid: "Lütfen geçerli bir e-posta adresi girin.", emailMax: "E-posta en fazla 200 karakter olabilir.",
  subjectMin: "Lütfen bir konu girin.", subjectMax: "Konu en fazla 160 karakter olabilir.",
  messageMin: "Lütfen en az 10 karakter girin.", messageMax: "Mesaj en fazla 5.000 karakter olabilir.",
};

export function createContactMessageSchema(messages: ValidationMessages) {
  return z.object({
    name: z.string().trim().min(2, messages.nameMin).max(100, messages.nameMax),
    email: z.string().trim().min(1, messages.emailRequired).email(messages.emailInvalid).max(200, messages.emailMax),
    subject: z.string().trim().min(2, messages.subjectMin).max(160, messages.subjectMax),
    message: z.string().trim().min(10, messages.messageMin).max(5000, messages.messageMax),
  });
}

export const contactMessageSchema = createContactMessageSchema(englishMessages);

export function contactMessageSchemaFor(locale: string | null) {
  const language = locale?.toLowerCase();
  if (language?.startsWith("ar")) return createContactMessageSchema(arabicMessages);
  if (language?.startsWith("tr")) return createContactMessageSchema(turkishMessages);
  return contactMessageSchema;
}

export type ContactMessage = z.infer<typeof contactMessageSchema>;
