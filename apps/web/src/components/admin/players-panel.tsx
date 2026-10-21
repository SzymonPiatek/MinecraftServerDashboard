"use client";

import type { OnlinePlayers } from "@mcd/shared";
import { useState } from "react";
import { usePolling } from "@/hooks/use-polling";
import { publicActions } from "@/lib/api";
import { Panel } from "./panel";

const POLL_MS = 10_000;

export function PlayersPanel({ className }: { className?: string }) {
  const [online, setOnline] = useState<OnlinePlayers | null>(null);

  usePolling(async (signal) => {
    try {
      setOnline(await publicActions.getPlayers({ signal }));
    } catch (e) {
      if (signal.aborted) throw e;
      setOnline(null);
    }
  }, POLL_MS);

  return (
    <Panel title={`Gracze online${online ? ` (${online.online}/${online.max})` : ""}`} className={className}>
      {!online && <p className="text-ink-muted">Sprawdzam…</p>}
      {online?.players.length === 0 && <p className="text-ink-muted">Nikogo nie ma na serwerze.</p>}
      <ul className="m-0 grid max-h-48 list-none gap-2 overflow-y-auto p-0">
        {online?.players.map((name) => (
          <li key={name} className="rounded-input border-[1.5px] border-line bg-paper px-4 py-1 font-mono">
            {name}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
