import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(HttpError.notFound("Route not found"));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (isBodyParserError(err)) {
    res.status(400).json({ error: "Malformed request body" });
    return;
  }
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
};

function isBodyParserError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "type" in err && String(err.type).startsWith("entity.");
}
