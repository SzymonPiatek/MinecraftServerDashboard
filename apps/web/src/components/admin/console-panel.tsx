"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type SubmitEvent } from "react";
import { useAction } from "@/hooks/use-action";
import { usePolling } from "@/hooks/use-polling";
import { adminActions, publicActions } from "@/lib/api";
import { cn } from "@/lib/cn";
import { getSuggestions, type Suggestion } from "@/lib/minecraft-commands";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

interface Entry {
  command: string;
  output: string;
}

const PLAYERS_POLL_MS = 15_000;

export function ConsolePanel({ className }: { className?: string }) {
  const [history, setHistory] = useState<Entry[]>([]);
  const [command, setCommand] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const { pending, feedback, run } = useAction();
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Nick suggestions are best-effort, so a failed fetch just leaves the list as it was.
  usePolling(async (signal) => {
    try {
      setPlayers((await publicActions.getPlayers({ signal })).players);
    } catch (e) {
      if (signal.aborted) throw e;
    }
  }, PLAYERS_POLL_MS);

  const {
    start,
    items,
    command: known,
  } = useMemo(() => getSuggestions(command, players), [command, players]);
  const open = focused && !dismissed && items.length > 0;

  function edit(value: string) {
    setCommand(value);
    setDismissed(false);
    setActive(-1);
  }

  function accept(item: Suggestion) {
    edit(`${command.slice(0, start)}${item.value} `);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setDismissed(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) =>
        event.key === "ArrowDown" ? (i + 1) % items.length : i <= 0 ? items.length - 1 : i - 1,
      );
    } else if (event.key === "Tab" || (event.key === "Enter" && active >= 0)) {
      event.preventDefault();
      accept(items[Math.max(active, 0)]);
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const sent = command.trim();
    if (!sent) return;
    const result = await run(() => adminActions.runConsoleCommand(sent));
    if (!result) return;
    setHistory((prev) => [...prev.slice(-49), { command: sent, output: result.output }]);
    edit("");
    requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }));
  }

  return (
    <Panel title="Konsola" className={cn("md:grid-rows-[auto_minmax(16rem,1fr)]", className)}>
      <div
        ref={logRef}
        className="h-64 overflow-y-auto rounded-input border-2 border-ink bg-ink p-3 font-mono text-sm text-paper md:h-auto"
        role="log"
        aria-label="Wyniki komend"
      >
        {history.length === 0 && (
          <p className="text-paper/60">Wpisz komendę bez ukośnika, np. „list”. Tab uzupełnia podpowiedź.</p>
        )}
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <p className="text-accent">&gt; {entry.command}</p>
            <p className="break-words whitespace-pre-wrap">{entry.output || "(brak odpowiedzi)"}</p>
          </div>
        ))}
      </div>

      <form className="relative flex gap-3" onSubmit={submit}>
        <Input
          ref={inputRef}
          className="min-w-0 flex-1 font-mono"
          value={command}
          onChange={(e) => edit(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={500}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-label="Komenda"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          placeholder="say Cześć"
        />
        <Button type="submit" size="sm" disabled={pending || !command.trim()}>
          Wyślij
        </Button>

        <ul
          id={listId}
          role="listbox"
          hidden={!open}
          className="absolute inset-x-0 top-full z-10 m-0 mt-1 grid max-h-64 list-none overflow-y-auto border-2 border-ink bg-ink p-1 font-mono text-sm text-paper shadow-card"
        >
          {items.map((item, i) => (
            <li
              key={item.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown would blur the input before the click lands and close the list.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => accept(item)}
              className={cn(
                "flex cursor-pointer items-baseline justify-between gap-3 px-2 py-1.5",
                i === active ? "bg-accent text-ink" : "hover:bg-paper/15",
              )}
            >
              <span>{item.value}</span>
              {item.detail && (
                <span className={cn("truncate text-xs", i === active ? "text-ink/70" : "text-paper/60")}>
                  {item.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      </form>

      <p className="font-mono text-sm break-words text-ink-muted empty:hidden">
        {known && `${known.usage} — ${known.description}`}
      </p>
      <FeedbackLine feedback={feedback} />
    </Panel>
  );
}
