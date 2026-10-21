import { contactBodySchema, type ContactBody } from "@mcd/shared";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../../middleware/validate.js";
import type { ContactService } from "./contact.service.js";

interface ContactRoutesOptions {
  rateLimit?: { limit: number; windowMs: number };
}

export function createContactRoutes(
  contact: ContactService,
  { rateLimit: limits = { limit: 5, windowMs: 60 * 60 * 1000 } }: ContactRoutesOptions = {},
): Router {
  const router = Router();

  const limiter = rateLimit({
    ...limits,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Za dużo wiadomości, spróbuj ponownie później" },
  });

  router.post("/", limiter, validateBody(contactBodySchema), async (req, res) => {
    const { website, ...message } = req.body as ContactBody;
    // Pretend success to bots so they get no signal to adapt to.
    if (!website) await contact.send(message);
    res.status(204).end();
  });

  return router;
}
