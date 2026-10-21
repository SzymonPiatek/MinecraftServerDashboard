"use client";

import type { AdminSession } from "@mcd/shared";
import { useCallback, useEffect, useState } from "react";
import { SESSION_EXPIRED_EVENT, adminFetch } from "@/lib/admin-api";
import { Dashboard } from "./dashboard";
import { LoginForm } from "./login-form";

type Session = { phase: "loading" } | { phase: "anonymous" } | { phase: "admin"; admin: AdminSession };

export function AdminApp() {
  const [session, setSession] = useState<Session>({ phase: "loading" });

  useEffect(() => {
    adminFetch<AdminSession>("/auth/me")
      .then((admin) => setSession({ phase: "admin", admin }))
      .catch(() => setSession({ phase: "anonymous" }));
  }, []);

  useEffect(() => {
    const expire = () => setSession({ phase: "anonymous" });
    window.addEventListener(SESSION_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
  }, []);

  const logout = useCallback(async () => {
    await adminFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    setSession({ phase: "anonymous" });
  }, []);

  if (session.phase === "loading") {
    return (
      <main className="grid min-h-dvh place-items-center">
        <p role="status" className="text-ink-muted">
          Ładowanie…
        </p>
      </main>
    );
  }
  if (session.phase === "anonymous") {
    return <LoginForm onLogin={(admin) => setSession({ phase: "admin", admin })} />;
  }
  return <Dashboard admin={session.admin} onLogout={logout} />;
}
