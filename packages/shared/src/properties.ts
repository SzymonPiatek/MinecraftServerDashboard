import { z } from "zod";

/**
 * Properties the dashboard must not change: docker-compose sets them from its own environment on every start, or
 * the stack depends on them (ports, RCON, whitelist). They are shown read-only.
 */
export const LOCKED_PROPERTIES = [
  "enable-query",
  "enable-rcon",
  "enforce-whitelist",
  "query.port",
  "rcon.port",
  "server-ip",
  "server-port",
  "white-list",
] as const;

/** Never sent to the browser or written back. */
export const HIDDEN_PROPERTIES = ["rcon.password"] as const;

export const serverPropertySchema = z.object({
  key: z.string(),
  /** The value as shown to the admin: `\uXXXX` escapes are decoded. */
  value: z.string(),
  locked: z.boolean(),
});
export type ServerProperty = z.infer<typeof serverPropertySchema>;

export const propertyKeySchema = z.string().regex(/^[A-Za-z0-9._-]{1,64}$/, "Invalid property name");

export const propertiesUpdateBodySchema = z.object({
  changes: z.record(propertyKeySchema, z.string().max(1000)),
  restart: z.boolean(),
});
export type PropertiesUpdateBody = z.infer<typeof propertiesUpdateBodySchema>;
