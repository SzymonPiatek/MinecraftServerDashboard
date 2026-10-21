"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { useAction } from "@/hooks/use-action";
import { adminActions } from "@/lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

interface Entry {
  command: string;
  output: string;
}

export function ConsolePanel() {
  const [history, setHistory] = useState<Entry[]>([]);
  const [command, setCommand] = useState("");
  const { pending, feedback, run } = useAction();
  const logRef = useRef<HTMLDivElement>(null);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const sent = command.trim();
    if (!sent) return;
    const result = await run(() => adminActions.runConsoleCommand(sent));
    if (!result) return;
    setHistory((prev) => [...prev.slice(-49), { command: sent, output: result.output }]);
    setCommand("");
    requestAnimationFrame(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }));
  }

  return (
    <Panel title="Konsola">
      <div
        ref={logRef}
        className="h-56 overflow-y-auto rounded-input border-2 border-ink bg-ink p-3 font-mono text-sm text-paper"
        role="log"
        aria-label="Wyniki komend"
      >
        {history.length === 0 && <p className="text-paper/60">Wpisz komendę bez ukośnika, np. „list”.</p>}
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <p className="text-accent">&gt; {entry.command}</p>
            <p className="whitespace-pre-wrap">{entry.output || "(brak odpowiedzi)"}</p>
          </div>
        ))}
      </div>
      <form className="flex gap-3" onSubmit={submit}>
        <Input
          className="font-mono"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          maxLength={500}
          autoComplete="off"
          spellCheck={false}
          aria-label="Komenda"
          placeholder="say Cześć"
        />
        <Button type="submit" size="sm" disabled={pending || !command.trim()}>
          Wyślij
        </Button>
      </form>
      <FeedbackLine feedback={feedback} />
    </Panel>
  );
}
