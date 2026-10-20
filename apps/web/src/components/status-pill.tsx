"use client";

import { useServerData } from "./server-data";
import styles from "./status-pill.module.css";

export function StatusPill() {
  const { status, unreachable } = useServerData();

  let label = "Sprawdzam status…";
  let state: "online" | "offline" | "unknown" = "unknown";
  if (status?.online) {
    label = `Online · ${status.playersOnline}/${status.playersMax} graczy`;
    state = "online";
  } else if (status) {
    label = "Serwer jest offline";
    state = "offline";
  } else if (unreachable) {
    label = "Status niedostępny";
  }

  return (
    <p className={styles.pill} data-state={state}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </p>
  );
}
