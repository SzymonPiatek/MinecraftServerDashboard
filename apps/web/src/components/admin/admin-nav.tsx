"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button, buttonVariants } from "../ui/button";
import { FloatingNav, NavBrand, NavList } from "../ui/nav-bar";

export function AdminNav({ onLogout }: { onLogout: () => void }) {
  return (
    <FloatingNav aria-label="Nawigacja panelu admina">
      {/* The way back to the dashboard from sub-pages; on phones only the icon fits. */}
      <NavBrand href="/admin" className="max-sm:inline-flex">
        <span className="max-sm:sr-only">Panel admina · {siteConfig.name}</span>
      </NavBrand>
      <NavList>
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
  );
}
