"use client";

import { useAdminSession } from "@/hooks/use-admin-session";
import { Dashboard } from "./dashboard";
import { LoginForm } from "./login-form";
import { LogsView } from "./logs-view";

export function AdminApp({ view = "dashboard" }: { view?: "dashboard" | "logs" }) {
  const { session, signIn, signOut } = useAdminSession();

  if (session.phase === "loading") {
    return (
      <main className="grid min-h-dvh place-items-center">
        <p role="status" className="text-paper/85">
          Ładowanie…
        </p>
      </main>
    );
  }
  if (session.phase === "anonymous") {
    return <LoginForm onLogin={signIn} />;
  }
  const View = view === "logs" ? LogsView : Dashboard;
  return <View onLogout={signOut} />;
}
