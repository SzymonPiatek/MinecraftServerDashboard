import { loginBodySchema, type LoginBody } from "@mcd/shared";
import { Router, type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../middleware/validate.js";
import type { AuthService } from "./auth.service.js";
import { currentAdmin } from "./require-admin.js";
import { SESSION_COOKIE, sessionCookieOptions } from "./session-cookie.js";

interface AuthRoutesOptions {
  auth: AuthService;
  requireAdmin: RequestHandler;
  isProduction: boolean;
  sessionTtlHours: number;
  loginRateLimit?: { limit: number; windowMs: number };
}

export function createAuthRoutes({
  auth,
  requireAdmin,
  isProduction,
  sessionTtlHours,
  loginRateLimit = { limit: 10, windowMs: 15 * 60 * 1000 },
}: AuthRoutesOptions): Router {
  const router = Router();
  const cookieOptions = sessionCookieOptions(isProduction, sessionTtlHours);

  const limiter = rateLimit({
    ...loginRateLimit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login attempts, try again later" },
  });

  router.post("/login", limiter, validateBody(loginBodySchema), async (req, res) => {
    const { username, password } = req.body as LoginBody;
    const { admin, token } = await auth.login(username, password);
    res.cookie(SESSION_COOKIE, token, cookieOptions).json(admin);
  });

  router.post("/logout", (_req, res) => {
    const { maxAge: _maxAge, ...clearOptions } = cookieOptions;
    res.clearCookie(SESSION_COOKIE, clearOptions).status(204).end();
  });

  router.get("/me", requireAdmin, (req, res) => {
    res.json(currentAdmin(req));
  });

  return router;
}
