"use client";

import { PLAYER_ACTIONS, type OnlinePlayers, type PlayerAction } from "@mcd/shared";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";
import { useAction } from "./use-action";

const ACTION_LABEL: Record<PlayerAction, string> = {
  kick: "Kick",
  ban: "Ban",
  pardon: "Pardon",
  op: "Op",
  deop: "Deop",
};

const DESTRUCTIVE: ReadonlySet<PlayerAction> = new Set(["ban", "op"]);

export function PlayersPanel() {
  const [online, setOnline] = useState<OnlinePlayers | null>(null);
  const [reloads, setReloads] = useState(0);
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState("");
  const { pending, feedback, run } = useAction();

  useEffect(() => {
    adminFetch<OnlinePlayers>("/players")
      .then(setOnline)
      .catch(() => setOnline(null));
  }, [reloads]);

  async function apply(action: PlayerAction) {
    const name = username.trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) return;
    if (DESTRUCTIVE.has(action) && !window.confirm(`${ACTION_LABEL[action]}: ${name}?`)) return;
    const result = await run(
      () =>
        adminFetch<{ message: string }>(`/admin/players/${encodeURIComponent(name)}/${action}`, {
          method: "POST",
          body: { reason: reason.trim() || undefined },
        }),
      (r) => r.message || `Wykonano: ${ACTION_LABEL[action]} ${name}.`,
    );
    if (result) setReloads((n) => n + 1);
  }

  return (
    <Panel
      title={`Gracze online${online ? ` (${online.online}/${online.max})` : ""}`}
      actions={
        <Button variant="ghost" size="sm" onClick={() => setReloads((n) => n + 1)}>
          Odśwież
        </Button>
      }
    >
      {online?.players.length === 0 && <p className="text-ink-muted">Nikogo nie ma na serwerze.</p>}
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {online?.players.map((name) => (
          <li key={name}>
            <Button
              variant="secondary"
              size="sm"
              className="font-mono shadow-none"
              onClick={() => setUsername(name)}
            >
              {name}
            </Button>
          </li>
        ))}
      </ul>

      <Field label="Nick gracza">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Wybierz z listy lub wpisz"
        />
      </Field>
      <Field label="Powód (opcjonalnie)">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={200}
          autoComplete="off"
        />
      </Field>
      <div className="flex flex-wrap gap-3">
        {PLAYER_ACTIONS.map((action) => (
          <Button
            key={action}
            variant="secondary"
            size="sm"
            disabled={pending || !/^[A-Za-z0-9_]{3,16}$/.test(username.trim())}
            onClick={() => void apply(action)}
          >
            {ACTION_LABEL[action]}
          </Button>
        ))}
      </div>
      <FeedbackLine feedback={feedback} />
    </Panel>
  );
}
