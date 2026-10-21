"use client";

import { useAdminSession } from "@/hooks/use-admin-session";
import { Dashboard } from "./dashboard";
import { LoginForm } from "./login-form";

export function AdminApp() {
  const { session, signIn, signOut } = useAdminSession();

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
    return <LoginForm onLogin={signIn} />;
  }
  return <Dashboard admin={session.admin} onLogout={signOut} />;
}
