"use client";

import type { AuditLogEntry } from "@mcd/shared";
import { useState } from "react";
import { usePolling } from "@/hooks/use-polling";
import { adminActions, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

const POLL_MS = 15_000;

const COLUMNS = ["Kiedy", "Admin", "Akcja", "Cel / szczegóły"];

/** No wrapping, so a column is as wide as its longest value; the gap on the right keeps neighbours apart. */
const CELL = "py-2 pr-6 whitespace-nowrap last:pr-0";
const HEAD_CELL = "sticky top-0 border-b-2 border-ink bg-[#c6c6c6] font-bold";

const formatDate = new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "medium" });

export function AuditPanel({ className }: { className?: string }) {
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePolling(async (signal) => {
    try {
      setEntries((await adminActions.getAuditLog(undefined, { signal })).entries);
      setError(null);
    } catch (e) {
      if (signal.aborted) throw e;
      setError(errorMessage(e));
    }
  }, POLL_MS);

  return (
    <Panel title="Dziennik akcji" className={className}>
      <FeedbackLine feedback={error ? { tone: "error", text: error } : null} />
      {entries?.length === 0 && <p className="text-ink-muted">Brak wpisów.</p>}
      {entries && entries.length > 0 && (
        // Columns take the width their content needs; when that exceeds the panel, the table scrolls sideways.
        <div className="max-h-96 min-w-0 overflow-auto text-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {COLUMNS.map((title) => (
                  <th key={title} className={cn(HEAD_CELL, CELL)}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-line">
                  <td className={CELL}>{formatDate.format(new Date(entry.createdAt))}</td>
                  <td className={CELL}>{entry.admin}</td>
                  <td className={cn(CELL, "font-mono")}>{entry.action}</td>
                  <td className={cn(CELL, "font-mono")}>
                    {[entry.target, entry.details].filter(Boolean).join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
