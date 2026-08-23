import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Please enter at least 2 characters.").max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().min(1, "Please enter your email address.").email("Please enter a valid email address.").max(200, "Email must be 200 characters or fewer."),
  subject: z.string().trim().min(2, "Please enter a subject.").max(160, "Subject must be 160 characters or fewer."),
  message: z.string().trim().min(10, "Please enter at least 10 characters.").max(5000, "Message must be 5,000 characters or fewer."),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;
