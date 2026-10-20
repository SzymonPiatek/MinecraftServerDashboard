import { z } from "zod";

export const loginBodySchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});
export type LoginBody = z.infer<typeof loginBodySchema>;

export const adminSessionSchema = z.object({
  id: z.number().int(),
  username: z.string(),
});
export type AdminSession = z.infer<typeof adminSessionSchema>;
