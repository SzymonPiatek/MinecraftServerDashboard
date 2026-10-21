import type { ContactBody } from "@mcd/shared";
import { createTransport } from "nodemailer";
import { HttpError } from "../../lib/http-error.js";

export interface ContactService {
  send(message: Omit<ContactBody, "website">): Promise<void>;
}

interface ContactOptions {
  host?: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  to: string;
}

export function createContactService({
  host,
  port,
  user,
  password,
  from,
  to,
}: ContactOptions): ContactService {
  const transport = host
    ? createTransport({
        host,
        port,
        // 465 is implicit TLS; on 587 nodemailer upgrades the connection with STARTTLS.
        secure: port === 465,
        auth: user && password ? { user, pass: password } : undefined,
        connectionTimeout: 10_000,
        socketTimeout: 15_000,
      })
    : null;

  return {
    async send({ name, email, message }) {
      if (!transport) throw HttpError.unavailable("Contact form is not configured");
      try {
        await transport.sendMail({
          from,
          to,
          // Reply goes to the visitor; the envelope sender stays our own mailbox so SPF/DKIM keep passing.
          replyTo: { name, address: email },
          subject: `[SPIATEK MC] Wiadomość od ${name}`,
          text: `Od: ${name} <${email}>\n\n${message}`,
        });
      } catch (error) {
        console.error("Failed to send contact mail", error);
        throw HttpError.unavailable("Could not send the message, try again later");
      }
    },
  };
}
