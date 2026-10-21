"use client";

import { useState, type FormEvent } from "react";
import styles from "./contact-form.module.css";

type Phase = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPhase("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Nie udało się wysłać wiadomości.");
      }
      form.reset();
      setPhase("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wysłać wiadomości.");
      setPhase("error");
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        <span>Nick lub imię</span>
        <input name="name" required maxLength={64} autoComplete="nickname" />
      </label>
      <label className={styles.field}>
        <span>Twój e-mail (na niego odpowiem)</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label className={styles.field}>
        <span>Wiadomość</span>
        <textarea name="message" required minLength={10} maxLength={2000} rows={6} />
      </label>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className={styles.trap} aria-hidden="true">
        <label>
          Strona WWW
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={phase === "sending"}>
          {phase === "sending" ? "Wysyłanie…" : "Wyślij wiadomość"}
        </button>
        <p className={styles.status} role="status" aria-live="polite">
          {phase === "sent" && "Wiadomość wysłana do admina."}
          {phase === "error" && <span className={styles.error}>{error}</span>}
        </p>
      </div>
    </form>
  );
}
