import { z } from "zod";

export const contactBodySchema = z.object({
  name: z.string().trim().min(1, "Podaj nick lub imię").max(64),
  email: z.email("Podaj poprawny adres e-mail").max(254),
  message: z.string().trim().min(10, "Wiadomość jest za krótka").max(2000),
  /** Honeypot: hidden from people, so anything in here means a bot filled in the form. */
  website: z.string().max(256).optional(),
});
export type ContactBody = z.infer<typeof contactBodySchema>;
