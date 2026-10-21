"use client";

import { useAdminSession } from "@/hooks/use-admin-session";
import { Dashboard } from "./dashboard";
import { PropertiesView } from "./properties-view";
import { LoginForm } from "./login-form";
import { GamerulesView } from "./gamerules-view";
import { LogsView } from "./logs-view";

const VIEWS = { dashboard: Dashboard, logs: LogsView, gamerules: GamerulesView, properties: PropertiesView };

export function AdminApp({ view = "dashboard" }: { view?: keyof typeof VIEWS }) {
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
  const View = VIEWS[view];
  return <View onLogout={signOut} />;
}
