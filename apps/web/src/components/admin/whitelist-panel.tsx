"use client";

import { useCallback, useEffect, useState, type SubmitEvent } from "react";
import { useAction } from "@/hooks/use-action";
import { adminActions } from "@/lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

export function WhitelistPanel() {
  const [players, setPlayers] = useState<string[] | null>(null);
  const [username, setUsername] = useState("");
  const { pending, feedback, run } = useAction();

  const load = useCallback(
    () => run(async () => setPlayers((await adminActions.getWhitelist()).players)),
    [run],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function add(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = username.trim();
    const ok = await run(
      () => adminActions.addToWhitelist(name).then(() => true),
      () => `Dodano ${name}.`,
    );
    if (!ok) return;
    setUsername("");
    setPlayers((prev) => (prev ? [...prev, name].sort((a, b) => a.localeCompare(b)) : prev));
  }

  async function remove(name: string) {
    if (!window.confirm(`Usunąć ${name} z whitelisty?`)) return;
    const ok = await run(
      () => adminActions.removeFromWhitelist(name).then(() => true),
      () => `Usunięto ${name}.`,
    );
    if (ok) setPlayers((prev) => prev?.filter((p) => p !== name) ?? prev);
  }

  return (
    <Panel
      title={`Whitelista${players ? ` (${players.length})` : ""}`}
      actions={
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => void load()}>
          Odśwież
        </Button>
      }
    >
      <form className="flex gap-3" onSubmit={add}>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          pattern="[A-Za-z0-9_]{3,16}"
          title="3–16 znaków: litery, cyfry, podkreślnik"
          required
          autoComplete="off"
          spellCheck={false}
          aria-label="Nick gracza"
          placeholder="Nick gracza"
        />
        <Button type="submit" size="sm" disabled={pending}>
          Dodaj
        </Button>
      </form>
      <FeedbackLine feedback={feedback} />
      {players?.length === 0 && <p className="text-ink-muted">Whitelista jest pusta.</p>}
      <ul className="m-0 grid max-h-72 list-none gap-2 overflow-y-auto p-0">
        {players?.map((name) => (
          <li
            key={name}
            className="flex items-center justify-between gap-3 rounded-input border-[1.5px] border-line bg-paper py-1 pr-1 pl-4"
          >
            <span className="font-mono">{name}</span>
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => void remove(name)}>
              Usuń
            </Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
