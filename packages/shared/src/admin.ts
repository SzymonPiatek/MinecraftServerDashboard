import { z } from "zod";
import { minecraftUsernameSchema } from "./minecraft.js";

export const whitelistAddBodySchema = z.object({
  username: minecraftUsernameSchema,
});
export type WhitelistAddBody = z.infer<typeof whitelistAddBodySchema>;

export const playerReasonBodySchema = z.object({
  reason: z.string().trim().max(200).optional(),
});
export type PlayerReasonBody = z.infer<typeof playerReasonBodySchema>;

export const bannedPlayerSchema = z.object({
  name: z.string(),
  reason: z.string(),
});
export type BannedPlayer = z.infer<typeof bannedPlayerSchema>;

export const PLAYER_ACTIONS = ["kick", "ban", "pardon", "op", "deop"] as const;
export const playerActionSchema = z.enum(PLAYER_ACTIONS);
export type PlayerAction = z.infer<typeof playerActionSchema>;

export const consoleCommandBodySchema = z.object({
  command: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(/^[^\r\n]+$/, "Command must be a single line"),
});
export type ConsoleCommandBody = z.infer<typeof consoleCommandBodySchema>;

export const SERVER_CONTROL_ACTIONS = ["start", "stop", "restart"] as const;
export const serverControlActionSchema = z.enum(SERVER_CONTROL_ACTIONS);
export type ServerControlAction = z.infer<typeof serverControlActionSchema>;

export const serviceStateSchema = z.enum(["active", "inactive", "failed", "unknown"]);
export type ServiceState = z.infer<typeof serviceStateSchema>;

export const auditLogEntrySchema = z.object({
  id: z.number().int(),
  admin: z.string(),
  action: z.string(),
  target: z.string().nullable(),
  details: z.string().nullable(),
  createdAt: z.string(),
});
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
