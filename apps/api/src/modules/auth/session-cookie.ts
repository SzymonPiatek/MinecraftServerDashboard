import type { CookieOptions } from "express";

export const SESSION_COOKIE = "session";

export function sessionCookieOptions(isProduction: boolean, ttlHours: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: ttlHours * 60 * 60 * 1000,
  };
}
