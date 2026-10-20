import { siteConfig } from "@/lib/site-config";
import { BlockArt } from "./block-art";
import { CopyAddress } from "./copy-address";
import styles from "./hero.module.css";
import { StatusPill } from "./status-pill";

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <StatusPill />
          <h1 className={styles.title}>
            {siteConfig.name}. <span className={styles.mark}>Zbuduj coś swojego.</span>
          </h1>
          <p className={styles.lede}>{siteConfig.description}</p>
          <div className={styles.actions}>
            <CopyAddress address={siteConfig.address} />
            <a className={styles.secondary} href="#join">
              Jak dołączyć →
            </a>
          </div>
        </div>
        <div className={styles.art}>
          <BlockArt />
        </div>
      </div>
    </section>
  );
}
