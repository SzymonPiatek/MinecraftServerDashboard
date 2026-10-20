import type { AdminSession } from "@mcd/shared";
import type { RequestHandler } from "express";
import { HttpError } from "../../lib/http-error.js";
import { SESSION_COOKIE } from "./session-cookie.js";
import type { AuthService } from "./auth.service.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminSession;
    }
  }
}

export function createRequireAdmin(auth: AuthService): RequestHandler {
  return async (req, _res, next) => {
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    const admin = typeof token === "string" ? await auth.resolveSession(token) : null;
    if (!admin) throw HttpError.unauthorized();
    req.admin = admin;
    next();
  };
}

/** Use inside handlers behind `requireAdmin`. */
export function currentAdmin(req: Express.Request): AdminSession {
  if (!req.admin) throw HttpError.unauthorized();
  return req.admin;
}
