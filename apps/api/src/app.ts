import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";
import { pinoHttp } from "pino-http";
import type { Container } from "./container.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { createAdminRoutes } from "./modules/admin/admin.routes.js";
import { createAuthRoutes } from "./modules/auth/auth.routes.js";
import { createRequireAdmin } from "./modules/auth/require-admin.js";
import { createPublicRoutes } from "./modules/minecraft/public.routes.js";

export function createApp(container: Container): Express {
  const { env } = container;
  const app = express();
  const isProduction = env.NODE_ENV === "production";

  app.set("trust proxy", env.TRUST_PROXY);
  app.disable("x-powered-by");

  const logger = pino({
    level: env.LOG_LEVEL,
    redact: ["req.headers.cookie", 'res.headers["set-cookie"]'],
  });
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());

  const requireAdmin = createRequireAdmin(container.auth);

  const api = express.Router();
  api.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  api.use(createPublicRoutes(container.minecraft));
  api.use(
    "/auth",
    createAuthRoutes({
      auth: container.auth,
      requireAdmin,
      isProduction,
      sessionTtlHours: env.SESSION_TTL_HOURS,
    }),
  );
  api.use(
    "/admin",
    createAdminRoutes({
      requireAdmin,
      whitelist: container.whitelist,
      players: container.players,
      rcon: container.rcon,
      serverControl: container.serverControl,
      audit: container.audit,
    }),
  );
  app.use("/api", api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
