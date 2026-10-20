import { siteConfig } from "@/lib/site-config";
import styles from "./site-nav.module.css";

const links = [
  { href: "#status", label: "Status" },
  { href: "#join", label: "Jak dołączyć" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  return (
    <header className={styles.wrap}>
      <nav className={styles.pill} aria-label="Główna nawigacja">
        <a className={styles.brand} href="#top">
          <span className={styles.brandMark} aria-hidden="true" />
          {siteConfig.name}
        </a>
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
