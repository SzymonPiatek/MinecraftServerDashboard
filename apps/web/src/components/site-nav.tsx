import { siteConfig } from "@/lib/site-config";
import { buttonVariants } from "./ui/button";
import { FloatingNav, NavBrand, NavList } from "./ui/nav-bar";

const links = [
  { href: "#status", label: "Status" },
  { href: "#join", label: "Jak dołączyć" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontakt", label: "Kontakt" },
];

export function SiteNav() {
  return (
    <FloatingNav aria-label="Główna nawigacja">
      <NavBrand href="#top">{siteConfig.name}</NavBrand>
      <NavList>
        {links.map((link) => (
          <li key={link.href}>
            <a
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "max-sm:px-2 max-sm:py-2",
              })}
              href={link.href}
            >
              {link.label}
            </a>
          </li>
        ))}
      </NavList>
    </FloatingNav>
  );
}
