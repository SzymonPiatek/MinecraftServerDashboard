"use client";

import { useEffect, useState } from "react";
import styles from "./copy-address.module.css";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      // Clipboard unavailable (e.g. insecure context); the address stays visible to copy by hand.
    }
  }

  return (
    <div className={styles.group}>
      <button type="button" className={styles.button} onClick={copy}>
        <code className={styles.address}>{address}</code>
        <span className={styles.action}>{copied ? "Skopiowano!" : "Kopiuj IP"}</span>
      </button>
      <span className={styles.live} role="status" aria-live="polite">
        {copied ? "Adres skopiowany do schowka" : ""}
      </span>
    </div>
  );
}
