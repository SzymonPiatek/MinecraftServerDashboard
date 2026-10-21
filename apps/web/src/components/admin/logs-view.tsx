"use client";

import type { LogLine } from "@mcd/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePolling } from "@/hooks/use-polling";
import { adminActions, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Container } from "../ui/section";
import { AdminNav } from "./admin-nav";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

const POLL_MS = 2_000;
const MAX_LINES = 1_000;
/** How close to the bottom (px) still counts as "following" the log. */
const BOTTOM_SLACK = 24;

/** What the admin can choose to see; `pattern` is matched against the whole line, `null` shows everything. */
const VIEWS = [
  { id: "all", label: "Wszystko", pattern: null },
  // Connect/disconnect chatter the dashboard itself generates with every command and status poll.
  { id: "rcon", label: "RCON", pattern: /rcon/i },
  { id: "chat", label: "Czat", pattern: /\]: <[^>]+> / },
  {
    id: "players",
    label: "Gracze",
    pattern: /joined the game|left the game|lost connection|logged in with entity|UUID of player/,
  },
  {
    id: "rejected",
    label: "Odrzucone",
    pattern: /not white-listed|is banned|handleDisconnection\(\) called twice|server is full/,
  },
  { id: "commands", label: "Komendy", pattern: /issued server command/ },
  {
    id: "advancements",
    label: "Osiągnięcia",
    pattern: /has (made the advancement|completed the challenge|reached the goal)/,
  },
  { id: "warn", label: "Ostrzeżenia", pattern: /\/WARN\]/ },
  { id: "error", label: "Błędy", pattern: /\/(ERROR|FATAL)\]/ },
] as const;

type ViewId = (typeof VIEWS)[number]["id"];

const levelClass = (text: string) =>
  /\/(ERROR|FATAL)\]/.test(text) ? "text-accent-3" : /\/WARN\]/.test(text) ? "text-accent" : undefined;

export function LogsView({ onLogout }: { onLogout: () => void }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(true);
  const [view, setView] = useState<ViewId>("all");
  const [query, setQuery] = useState("");
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

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const { pattern } = VIEWS.find((v) => v.id === view)!;
    return lines.filter(
      ({ text }) => (!pattern || pattern.test(text)) && (!needle || text.toLowerCase().includes(needle)),
    );
  }, [lines, view, query]);
  const filtered = view !== "all" || query.trim() !== "";

  useEffect(() => {
    const log = logRef.current;
    if (following && log) log.scrollTop = log.scrollHeight;
  }, [visible, following]);

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
            className="h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)]"
            title="Logi serwera"
            actions={
              <div className="flex max-w-full min-w-0 items-center gap-3">
                <Input
                  className="min-w-0 flex-[0_1_20rem]"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Szukaj…"
                  aria-label="Filtruj logi"
                  autoComplete="off"
                  spellCheck={false}
                />
                {!following && (
                  <Button
                    variant="secondary"
                    size="sm"
                    wrapperClassName="shrink-0"
                    onClick={() => setFollowing(true)}
                  >
                    Na dół
                  </Button>
                )}
              </div>
            }
          >
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pokaż w logach">
              {VIEWS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => setView(id)}
                  className={cn(
                    "cursor-pointer rounded-pill border-2 border-ink px-3 py-0.5 text-sm",
                    view === id ? "bg-ink text-paper" : "hover:bg-accent",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div
              ref={logRef}
              onScroll={onScroll}
              className="min-h-0 overflow-y-auto rounded-input border-2 border-ink bg-ink p-3 font-mono text-sm text-paper"
              role="log"
              aria-label="Logi serwera"
            >
              {!loaded && !error && <p className="text-paper/60">Ładowanie…</p>}
              {loaded && visible.length === 0 && (
                <p className="text-paper/60">
                  {filtered && lines.length > 0 ? "Brak logów pasujących do filtra." : "Brak logów."}
                </p>
              )}
              {visible.map((line, i) => (
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
