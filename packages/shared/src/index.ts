import { z } from "zod";

export const serverStatusSchema = z.object({
  online: z.boolean(),
  playersOnline: z.number().int().nonnegative(),
  playersMax: z.number().int().nonnegative(),
  version: z.string().nullable(),
  motd: z.string().nullable(),
  pingMs: z.number().nullable(),
});
export type ServerStatus = z.infer<typeof serverStatusSchema>;
