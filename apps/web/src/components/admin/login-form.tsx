"use client";

import type { AdminSession } from "@mcd/shared";
import { useState, type SubmitEvent } from "react";
import { adminFetch, errorMessage } from "@/lib/admin-api";
import { siteConfig } from "@/lib/site-config";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Field } from "../ui/field";
import { Input } from "../ui/input";

export function LoginForm({ onLogin }: { onLogin: (admin: AdminSession) => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      onLogin(
        await adminFetch<AdminSession>("/auth/login", {
          method: "POST",
          body: { username: form.get("username"), password: form.get("password") },
        }),
      );
    } catch (e) {
      setError(errorMessage(e));
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-(--page-gutter) py-12">
      <Card
        as="form"
        tone="muted"
        padding="lg"
        elevated
        className="grid w-full max-w-md gap-6"
        onSubmit={submit}
      >
        <div className="grid gap-1">
          <h1 className="text-2xl">Panel admina</h1>
          <p className="text-ink-muted">{siteConfig.name}</p>
        </div>
        <Field label="Login">
          <Input name="username" required maxLength={64} autoComplete="username" autoFocus />
        </Field>
        <Field label="Hasło">
          <Input name="password" type="password" required maxLength={256} autoComplete="current-password" />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Logowanie…" : "Zaloguj"}
        </Button>
        <p role="alert" className="font-semibold text-accent-3 empty:hidden">
          {error}
        </p>
      </Card>
    </main>
  );
}
