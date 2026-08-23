"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { contactMessageSchema, type ContactMessage } from "@/lib/contact-schema";
import type { SiteSettings } from "@/lib/site-settings";

export function ContactForm({ settings }: { settings: SiteSettings }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function submit(values: ContactMessage) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Could not send your message.");

      reset();
      toast.success(settings.formSuccessTitle, {
        description: settings.formSuccessMessage,
      });
    } catch (error) {
      toast.error(settings.formErrorTitle, {
        description: error instanceof Error ? error.message : settings.formErrorMessage,
      });
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate>
      <label className={errors.name ? "field-invalid" : undefined} htmlFor="contact-name">{settings.formNameLabel}<input id="contact-name" autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} />{errors.name && <FieldError id="contact-name-error" message={errors.name.message} />}</label>
      <label className={errors.email ? "field-invalid" : undefined} htmlFor="contact-email">{settings.formEmailLabel}<input id="contact-email" type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} />{errors.email && <FieldError id="contact-email-error" message={errors.email.message} />}</label>
      <label className={errors.subject ? "field-invalid" : undefined} htmlFor="contact-subject">{settings.formSubjectLabel}<input id="contact-subject" {...register("subject")} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "contact-subject-error" : undefined} />{errors.subject && <FieldError id="contact-subject-error" message={errors.subject.message} />}</label>
      <label className={errors.message ? "field-invalid" : undefined} htmlFor="contact-message">{settings.formMessageLabel}<textarea id="contact-message" rows={6} {...register("message")} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : undefined} />{errors.message && <FieldError id="contact-message-error" message={errors.message.message} />}</label>
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? settings.formSendingLabel : settings.formSubmitLabel}<Send size={17} />
      </button>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return <span className="field-message" id={id} role="alert"><CircleAlert size={14} aria-hidden="true" />{message}</span>;
}
