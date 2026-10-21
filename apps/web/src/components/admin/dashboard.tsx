"use client";

import { Container } from "../ui/section";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
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
          <PageLinks />
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

/** Entry points to the sub-pages, kept right under the server controls. */
function PageLinks() {
  const router = useRouter();
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6">
      {[
        { href: "/admin/logs", label: "Logi serwera" },
        { href: "/admin/gamerules", label: "Zarządzaj gamerule" },
      ].map(({ href, label }) => (
        <Button
          key={href}
          variant="secondary"
          size="sm"
          wrapperClassName="w-full"
          className="w-full"
          onClick={() => router.push(href)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
