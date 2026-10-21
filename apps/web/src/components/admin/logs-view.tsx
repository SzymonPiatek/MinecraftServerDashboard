"use client";

import type { LogLine } from "@mcd/shared";
import { useEffect, useRef, useState } from "react";
import { usePolling } from "@/hooks/use-polling";
import { adminActions, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Button } from "../ui/button";
import { Container } from "../ui/section";
import { AdminNav } from "./admin-nav";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

const POLL_MS = 2_000;
const MAX_LINES = 1_000;
/** How close to the bottom (px) still counts as "following" the log. */
const BOTTOM_SLACK = 24;

const levelClass = (text: string) =>
  /\/(ERROR|FATAL)\]/.test(text) ? "text-accent-3" : /\/WARN\]/.test(text) ? "text-accent" : undefined;

export function LogsView({ onLogout }: { onLogout: () => void }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(true);
  const cursor = useRef<string>(undefined);
  const logRef = useRef<HTMLDivElement>(null);

  usePolling(async (signal) => {
    try {
      const { lines: fresh } = await adminActions.getLogs(cursor.current, { signal });
      // Unmounted (or a dev double-mount) while the request was in flight: drop it so lines are never added twice.
      if (signal.aborted) return;
      setError(null);
      setLoaded(true);
      const last = fresh.at(-1)?.time;
      if (!last) return;
      cursor.current = last;
      setLines((prev) => [...prev, ...fresh].slice(-MAX_LINES));
    } catch (e) {
      if (signal.aborted) throw e;
      setError(errorMessage(e));
    }
  }, POLL_MS);

  useEffect(() => {
    const log = logRef.current;
    if (following && log) log.scrollTop = log.scrollHeight;
  }, [lines, following]);

  function onScroll() {
    const log = logRef.current;
    if (log) setFollowing(log.scrollHeight - log.scrollTop - log.clientHeight < BOTTOM_SLACK);
  }

  return (
    <>
      <AdminNav onLogout={onLogout} />
      <main className="h-dvh overflow-hidden">
        {/* The page is exactly one screen tall; only the log itself scrolls. */}
        <Container className="h-full pt-24 pb-4 md:pt-28 md:pb-6">
          <Panel
            className="h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]"
            title="Logi serwera"
            actions={
              !following && (
                <Button variant="secondary" size="sm" onClick={() => setFollowing(true)}>
                  Na dół
                </Button>
              )
            }
          >
            <div
              ref={logRef}
              onScroll={onScroll}
              className="min-h-0 overflow-y-auto rounded-input border-2 border-ink bg-ink p-3 font-mono text-sm text-paper"
              role="log"
              aria-label="Logi serwera"
            >
              {!loaded && !error && <p className="text-paper/60">Ładowanie…</p>}
              {loaded && lines.length === 0 && <p className="text-paper/60">Brak logów.</p>}
              {lines.map((line, i) => (
                <p key={i} className={cn("break-words whitespace-pre-wrap", levelClass(line.text))}>
                  {line.text}
                </p>
              ))}
            </div>
            <FeedbackLine feedback={error ? { tone: "error", text: error } : null} />
          </Panel>
        </Container>
      </main>
    </>
  );
}
