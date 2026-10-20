import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.url().default("http://localhost:3000"),
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(0),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  DATABASE_URL: z.string().default("file:./dev.db"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(12),
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  MC_HOST: z.string().default("127.0.0.1"),
  MC_PORT: z.coerce.number().int().positive().default(25565),
  MC_QUERY_PORT: z.coerce.number().int().positive().default(25565),
  MC_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),
  MC_STATUS_CACHE_MS: z.coerce.number().int().nonnegative().default(5000),
  RCON_PORT: z.coerce.number().int().positive().default(25575),
  RCON_PASSWORD: z.string().min(1),
  MC_SYSTEMD_UNIT: z.string().regex(/^[\w@.-]+$/).default("minecraft"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}
