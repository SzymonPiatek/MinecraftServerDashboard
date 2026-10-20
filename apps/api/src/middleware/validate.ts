import type { RequestHandler } from "express";
import type { z } from "zod";
import { HttpError } from "../lib/http-error.js";

export function validateBody<S extends z.ZodType>(schema: S): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      throw HttpError.badRequest(result.error.issues.map((i) => i.message).join("; "));
    }
    req.body = result.data;
    next();
  };
}

export function parseParam<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw HttpError.badRequest(result.error.issues[0]?.message ?? "Invalid parameter");
  return result.data;
}
