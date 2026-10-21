"use client";

import type { AdminSession } from "@mcd/shared";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button } from "../ui/button";
import { Container } from "../ui/section";
import { AuditPanel } from "./audit-panel";
import { ConsolePanel } from "./console-panel";
import { PlayersPanel } from "./players-panel";
import { ServerPanel } from "./server-panel";
import { WhitelistPanel } from "./whitelist-panel";

export function Dashboard({ admin, onLogout }: { admin: AdminSession; onLogout: () => void }) {
  return (
    <>
      <header className="border-b-2 border-ink bg-paper-2 text-ink">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <h1 className="text-lg">Panel admina · {siteConfig.name}</h1>
            <p className="text-sm text-ink-muted">Zalogowano jako {admin.username}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="text-sm" href="/">
              Strona serwera
            </Link>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              Wyloguj
            </Button>
          </div>
        </Container>
      </header>
      <main>
        <Container className="grid items-start gap-6 py-8 md:grid-cols-2">
          <ServerPanel />
          <ConsolePanel />
          <WhitelistPanel />
          <PlayersPanel />
          <AuditPanel className="md:col-span-2" />
        </Container>
      </main>
    </>
  );
}
