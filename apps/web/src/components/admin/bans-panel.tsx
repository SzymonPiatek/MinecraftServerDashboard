"use client";

import type { BannedPlayer } from "@mcd/shared";
import { useState } from "react";
import { usePolling } from "@/hooks/use-polling";
import { adminActions, errorMessage } from "@/lib/api";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

const POLL_MS = 30_000;

export function BansPanel({ className }: { className?: string }) {
  const [bans, setBans] = useState<BannedPlayer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePolling(async (signal) => {
    try {
      setBans((await adminActions.getBans({ signal })).players);
      setError(null);
    } catch (e) {
      if (signal.aborted) throw e;
      setError(errorMessage(e));
    }
  }, POLL_MS);

  return (
    <Panel title={`Zbanowani${bans ? ` (${bans.length})` : ""}`} className={className}>
      <FeedbackLine feedback={error ? { tone: "error", text: error } : null} />
      {!bans && !error && <p className="text-ink-muted">Sprawdzam…</p>}
      {bans?.length === 0 && <p className="text-ink-muted">Nikt nie jest zbanowany.</p>}
      <ul className="m-0 grid max-h-56 list-none gap-2 overflow-y-auto p-0">
        {bans?.map(({ name, reason }) => (
          <li key={name} className="rounded-input border-[1.5px] border-line bg-paper px-4 py-1">
            <span className="font-mono">{name}</span>
            {reason && <span className="block text-sm break-words text-ink-muted">{reason}</span>}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
