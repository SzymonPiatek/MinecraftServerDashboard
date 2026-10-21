"use client";

import type { AdminSession } from "@mcd/shared";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button, buttonVariants } from "../ui/button";
import { FloatingNav, NavBrand, NavList } from "../ui/nav-bar";
import { Container } from "../ui/section";
import { AuditPanel } from "./audit-panel";
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
        {/* Mobile: one column, status first. md+: console on the left spanning the three side panels. */}
        <Container className="grid items-start gap-4 pt-24 pb-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-6 md:pt-28">
          <ServerPanel className="md:col-start-2" />
          <PlayersPanel className="md:col-start-2" />
          <ConsolePanel className="md:col-start-1 md:row-span-3 md:row-start-1 md:self-stretch" />
          <WhitelistPanel className="md:col-start-2" />
          <AuditPanel className="md:col-span-2" />
        </Container>
      </main>
    </>
  );
}
