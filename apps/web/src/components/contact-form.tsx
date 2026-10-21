"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type Phase = "idle" | "sending" | "sent" | "error";

const FALLBACK_ERROR = "Nie udało się wysłać wiadomości.";

async function sendMessage(form: HTMLFormElement): Promise<string | null> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    if (res.ok) return null;
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return body?.error ?? FALLBACK_ERROR;
  } catch {
    return FALLBACK_ERROR;
  }
}

export function ContactForm() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPhase("sending");
    const failure = await sendMessage(form);
    if (failure) {
      setError(failure);
      setPhase("error");
      return;
    }
    form.reset();
    setPhase("sent");
  }

  return (
    <Card as="form" tone="muted" padding="lg" elevated className="grid gap-6" onSubmit={submit}>
      <Field label="Nick lub imię">
        <Input name="name" required maxLength={64} autoComplete="nickname" />
      </Field>
      <Field label="Twój e-mail (na niego odpowiem)">
        <Input name="email" type="email" required maxLength={254} autoComplete="email" />
      </Field>
      <Field label="Wiadomość">
        <Textarea name="message" required minLength={10} maxLength={2000} rows={6} />
      </Field>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="absolute -left-2500 size-px overflow-hidden" aria-hidden="true">
        <label>
          Strona WWW
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={phase === "sending"}>
          {phase === "sending" ? "Wysyłanie…" : "Wyślij wiadomość"}
        </Button>
        <p role="status" aria-live="polite">
          {phase === "sent" && "Dzięki! Wiadomość poszła do admina."}
          {phase === "error" && <span className="font-semibold text-accent-3">{error}</span>}
        </p>
      </div>
    </Card>
  );
}
