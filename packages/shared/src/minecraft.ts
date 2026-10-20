import { z } from "zod";

export const minecraftUsernameSchema = z.string().regex(/^[A-Za-z0-9_]{3,16}$/, "Invalid Minecraft username");

export const serverStatusSchema = z.object({
  online: z.boolean(),
  playersOnline: z.number().int().nonnegative(),
  playersMax: z.number().int().nonnegative(),
  version: z.string().nullable(),
  motd: z.string().nullable(),
  pingMs: z.number().nullable(),
});
export type ServerStatus = z.infer<typeof serverStatusSchema>;

export const onlinePlayersSchema = z.object({
  online: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
  players: z.array(z.string()),
});
export type OnlinePlayers = z.infer<typeof onlinePlayersSchema>;
