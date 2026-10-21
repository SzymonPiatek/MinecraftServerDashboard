"use client";

import type { Gamerule } from "@mcd/shared";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { describeGamerule } from "@/lib/gamerule-descriptions";
import { useAction } from "@/hooks/use-action";
import { adminActions } from "@/lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Container } from "../ui/section";
import { AdminNav } from "./admin-nav";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

/**
 * Phones stack name, description and action; from sm the action sits beside the name with the description below;
 * from lg the three are real columns.
 */
const COLUMNS = "grid gap-x-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[19rem_minmax(0,1fr)_15rem]";

type SetRule = (name: string, value: boolean | number) => void;

export function GamerulesView({ onLogout }: { onLogout: () => void }) {
  const [rules, setRules] = useState<Gamerule[] | null>(null);
  const [filter, setFilter] = useState("");
  const { pending, feedback, run } = useAction();

  // Reading every rule takes a couple of seconds, so it is loaded once and refreshed on demand.
  const load = useCallback(() => run(async () => setRules((await adminActions.getGamerules()).rules)), [run]);

  useEffect(() => {
    void load();
  }, [load]);

  async function set(name: string, value: boolean | number) {
    const saved = await run(
      () => adminActions.setGamerule(name, value),
      () => `Ustawiono ${name}: ${value}.`,
    );
    if (saved) setRules((prev) => prev?.map((rule) => (rule.name === name ? saved : rule)) ?? prev);
  }

  const visible = rules?.filter((rule) => rule.name.includes(filter.trim().toLowerCase()));

  return (
    <>
      <AdminNav onLogout={onLogout} />
      <main>
        <Container className="pt-24 pb-8 md:pt-28">
          <Panel
            title={`Gamerule${rules ? ` (${rules.length})` : ""}`}
            actions={
              <Button variant="ghost" size="sm" disabled={pending} onClick={() => void load()}>
                Odśwież
              </Button>
            }
          >
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Szukaj reguły"
              placeholder="Szukaj reguły"
            />
            <FeedbackLine feedback={feedback} />
            {!rules && !feedback && <p className="text-ink-muted">Wczytuję reguły z serwera…</p>}
            {visible?.length === 0 && <p className="text-ink-muted">Brak pasujących reguł.</p>}
            {visible && visible.length > 0 && (
              <div>
                <div className={cn(COLUMNS, "hidden border-b-2 border-ink py-2 font-bold lg:grid")}>
                  <span>Reguła</span>
                  <span>Opis</span>
                  <span className="justify-self-end">Akcja</span>
                </div>
                <ul className="m-0 list-none p-0">
                  {visible.map((rule) => (
                    // Keyed by value so a saved number resets the row's draft.
                    <GameruleRow
                      key={`${rule.name}:${rule.value}`}
                      rule={rule}
                      disabled={pending}
                      onSet={set}
                    />
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        </Container>
      </main>
    </>
  );
}

function GameruleRow({ rule, disabled, onSet }: { rule: Gamerule; disabled: boolean; onSet: SetRule }) {
  const [draft, setDraft] = useState(String(rule.value));
  const valid = /^-?\d+$/.test(draft) && Number(draft) !== rule.value;

  return (
    <li className={cn(COLUMNS, "items-center gap-y-2 border-b border-line py-3")}>
      <span className="min-w-0 font-mono text-sm font-bold break-words sm:col-start-1 sm:row-start-1">
        {rule.name}
      </span>
      <span className="min-w-0 text-sm text-ink-muted sm:col-span-2 sm:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
        {describeGamerule(rule.name) ?? "Brak opisu."}
      </span>
      <div className="min-w-0 sm:col-start-2 sm:row-start-1 lg:col-start-3 lg:justify-self-end">
        {typeof rule.value === "boolean" ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={disabled}
            aria-pressed={rule.value}
            onClick={() => onSet(rule.name, !rule.value)}
          >
            {rule.value ? "Włączone" : "Wyłączone"}
          </Button>
        ) : (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) onSet(rule.name, Number(draft));
            }}
          >
            <Input
              className="w-28 max-sm:flex-1"
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={`Wartość ${rule.name}`}
            />
            <Button type="submit" size="sm" disabled={disabled || !valid}>
              Zapisz
            </Button>
          </form>
        )}
      </div>
    </li>
  );
}
