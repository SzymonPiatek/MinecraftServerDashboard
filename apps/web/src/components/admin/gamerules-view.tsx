"use client";

import type { Gamerule } from "@mcd/shared";
import { useState } from "react";
import { describeGamerule } from "@/lib/gamerule-descriptions";
import { useAction } from "@/hooks/use-action";
import { usePolling } from "@/hooks/use-polling";
import { adminActions, errorMessage } from "@/lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Container } from "../ui/section";
import { AdminNav } from "./admin-nav";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";
import { SettingRow, SettingsHeader } from "./setting-row";

const POLL_MS = 30_000;

type SetRule = (name: string, value: boolean | number) => void;

export function GamerulesView({ onLogout }: { onLogout: () => void }) {
  const [rules, setRules] = useState<Gamerule[] | null>(null);
  const [filter, setFilter] = useState("");
  const { pending, feedback, run } = useAction();

  const [loadError, setLoadError] = useState<string | null>(null);

  // Reading every rule takes a couple of seconds, hence the longer interval.
  usePolling(async (signal) => {
    try {
      setRules((await adminActions.getGamerules({ signal })).rules);
      setLoadError(null);
    } catch (e) {
      if (signal.aborted) throw e;
      setLoadError(errorMessage(e));
    }
  }, POLL_MS);

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
          <Panel title={`Gamerule${rules ? ` (${rules.length})` : ""}`}>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Szukaj reguły"
              placeholder="Szukaj reguły"
            />
            <FeedbackLine feedback={feedback ?? (loadError ? { tone: "error", text: loadError } : null)} />
            {!rules && !feedback && !loadError && (
              <p className="text-ink-muted">Wczytuję reguły z serwera…</p>
            )}
            {visible?.length === 0 && <p className="text-ink-muted">Brak pasujących reguł.</p>}
            {visible && visible.length > 0 && (
              <div>
                <SettingsHeader names={["Reguła", "Opis", "Akcja"]} />
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
    <SettingRow name={rule.name} description={describeGamerule(rule.name) ?? "Brak opisu."}>
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
    </SettingRow>
  );
}
