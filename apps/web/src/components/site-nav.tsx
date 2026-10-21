import { siteConfig } from "@/lib/site-config";
import { buttonVariants } from "./ui/button";

const links = [
  { href: "#status", label: "Status" },
  { href: "#join", label: "Jak dołączyć" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontakt", label: "Kontakt" },
];

export function SiteNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-10 flex justify-center px-(--page-gutter)">
      <nav
        className="pointer-events-auto flex max-w-full items-center justify-between gap-6 rounded-pill border-[1.5px] border-ink bg-[color-mix(in_oklch,var(--color-paper)_88%,transparent)] py-2 pr-2 pl-4 shadow-[0_3px_0_var(--color-ink)] backdrop-blur-md max-sm:p-1"
        aria-label="Główna nawigacja"
      >
        <a
          className="inline-flex items-center gap-2 font-bold tracking-tight whitespace-nowrap text-ink no-underline max-sm:hidden"
          href="#top"
        >
          <span
            className="size-[1.1rem] rounded-sm border-[1.5px] border-ink bg-mint shadow-[inset_0_-5px_0_var(--color-accent)]"
            aria-hidden="true"
          />
          {siteConfig.name}
        </a>
        <ul className="m-0 flex list-none gap-1 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <a className={buttonVariants({ variant: "ghost", size: "sm" })} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
