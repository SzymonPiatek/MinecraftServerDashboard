import { siteConfig } from "@/lib/site-config";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.wordmark}>{siteConfig.name}</p>
        <div className={styles.meta}>
          <p>{siteConfig.contact}</p>
          <p className={styles.small}>
            Serwer niezwiązany z Mojang Studios ani Microsoft. Minecraft jest znakiem towarowym Mojang AB.
          </p>
        </div>
      </div>
    </footer>
  );
}
