"use client";

import type { AuditLogEntry } from "@mcd/shared";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "../ui/button";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";
import { useAction } from "./use-action";

const formatDate = new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "medium" });

export function AuditPanel({ className }: { className?: string }) {
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);
  const { pending, feedback, run } = useAction();

  const load = useCallback(
    () =>
      run(async () =>
        setEntries((await adminFetch<{ entries: AuditLogEntry[] }>("/admin/audit-log?limit=50")).entries),
      ),
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
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-paper">
              <tr className="border-b-2 border-ink">
                <th className="py-2 pr-4">Kiedy</th>
                <th className="py-2 pr-4">Admin</th>
                <th className="py-2 pr-4">Akcja</th>
                <th className="py-2">Cel / szczegóły</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-line align-top">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {formatDate.format(new Date(entry.createdAt))}
                  </td>
                  <td className="py-2 pr-4">{entry.admin}</td>
                  <td className="py-2 pr-4 font-mono">{entry.action}</td>
                  <td className="py-2 font-mono break-all">
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
