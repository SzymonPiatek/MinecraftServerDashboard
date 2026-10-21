"use client";

import type { AdminSession } from "@mcd/shared";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button, buttonVariants } from "../ui/button";
import { FloatingNav, NavBrand, NavList } from "../ui/nav-bar";
import { Container } from "../ui/section";
import { AuditPanel } from "./audit-panel";
import { BansPanel } from "./bans-panel";
import { ConsolePanel } from "./console-panel";
import { PlayersPanel } from "./players-panel";
import { ServerPanel } from "./server-panel";
import { WhitelistPanel } from "./whitelist-panel";

export function Dashboard({ admin, onLogout }: { admin: AdminSession; onLogout: () => void }) {
  return (
    <>
      <FloatingNav aria-label="Nawigacja panelu admina">
        <NavBrand href="/admin">Panel admina · {siteConfig.name}</NavBrand>
        <NavList>
          <li className="px-2 text-sm text-ink-muted max-md:hidden">Zalogowano jako {admin.username}</li>
          <li>
            <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/">
              Strona serwera
            </Link>
          </li>
          <li>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Wyloguj
            </Button>
          </li>
        </NavList>
      </FloatingNav>
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
