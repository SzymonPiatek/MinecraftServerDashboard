"use client";

import type { AuditLogEntry } from "@mcd/shared";
import { useCallback, useEffect, useState } from "react";
import { useAction } from "@/hooks/use-action";
import { adminActions } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Button } from "../ui/button";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

/** Shared by the header and the entries so the desktop columns line up (the log is always full width). */
const ROW = "py-2 md:grid md:grid-cols-[10rem_7rem_11rem_minmax(0,1fr)] md:gap-x-4";

const formatDate = new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "medium" });

export function AuditPanel({ className }: { className?: string }) {
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const { pending, feedback, run } = useAction();

  const load = useCallback(
    () => run(async () => setEntries((await adminActions.getAuditLog()).entries)),
    [run],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Panel
      title="Dziennik akcji"
      className={className}
      actions={
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => void load()}>
          Odśwież
        </Button>
      }
    >
      <FeedbackLine feedback={feedback} />
      {entries?.length === 0 && <p className="text-ink-muted">Brak wpisów.</p>}
      {entries && entries.length > 0 && (
        <div className="max-h-96 overflow-y-auto text-sm">
          <div
            className={cn(ROW, "sticky top-0 hidden border-b-2 border-ink bg-[#c6c6c6] font-bold md:grid")}
          >
            <span>Kiedy</span>
            <span>Admin</span>
            <span>Akcja</span>
            <span>Cel / szczegóły</span>
          </div>
          <ul className="m-0 list-none p-0">
            {entries.map((entry) => (
              <li key={entry.id} className={cn(ROW, "flex flex-wrap gap-x-3 border-b border-line")}>
                <span className="whitespace-nowrap text-ink-muted md:text-ink">
                  {formatDate.format(new Date(entry.createdAt))}
                </span>
                <span>{entry.admin}</span>
                <span className="font-mono">{entry.action}</span>
                <span className="basis-full font-mono break-words md:basis-auto">
                  {[entry.target, entry.details].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
