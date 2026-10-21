"use client";

import { Container } from "../ui/section";
import { AdminNav } from "./admin-nav";
import { AuditPanel } from "./audit-panel";
import { BansPanel } from "./bans-panel";
import { ConsolePanel } from "./console-panel";
import { PlayersPanel } from "./players-panel";
import { ServerPanel } from "./server-panel";
import { WhitelistPanel } from "./whitelist-panel";

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <AdminNav onLogout={onLogout} />
      <main>
        {/* Status, console and log span the page; the lists share a two-column grid of equal-height tiles
            that scroll internally, so long lists never push the full-width panels around. */}
        <Container className="grid gap-4 pt-24 pb-8 md:gap-6 md:pt-28">
          <ServerPanel />
          <ConsolePanel />
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <PlayersPanel />
            <WhitelistPanel />
            <BansPanel className="md:col-span-2" />
          </div>
          <AuditPanel />
        </Container>
      </main>
    </>
  );
}
