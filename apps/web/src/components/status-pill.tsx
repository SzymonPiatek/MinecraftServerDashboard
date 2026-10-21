"use client";

import { useServerData } from "./server-data";
import { Badge, Dot } from "./ui/badge";

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
    <Badge tone="muted" leading="dot">
      <Dot state={state} />
      {label}
    </Badge>
  );
}
