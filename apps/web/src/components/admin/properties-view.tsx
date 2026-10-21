"use client";

import type { ServerProperty } from "@mcd/shared";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAction } from "@/hooks/use-action";
import { adminActions } from "@/lib/api";
import { describeProperty, PROPERTY_CHOICES } from "@/lib/property-descriptions";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Container } from "../ui/section";
import { AdminNav } from "./admin-nav";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";
import { SettingRow, SettingsHeader } from "./setting-row";

const RESTART_CONFIRM = "Zapisać zmiany i zrestartować serwer? Gracze zostaną rozłączeni.";

export function PropertiesView({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const [saved, setSaved] = useState<ServerProperty[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const { pending, feedback, run } = useAction();

  const load = useCallback(
    () =>
      run(async () => {
        const { properties } = await adminActions.getProperties();
        setSaved(properties);
        setValues(Object.fromEntries(properties.map((p) => [p.key, p.value])));
      }),
    [run],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const changes = Object.fromEntries(
    (saved ?? [])
      .filter((p) => !p.locked && values[p.key] !== p.value)
      .map((p) => [p.key, values[p.key] ?? ""]),
  );
  const changedCount = Object.keys(changes).length;

  async function save(restart: boolean) {
    if (restart && !window.confirm(RESTART_CONFIRM)) return;
    const result = await run(
      () => adminActions.saveProperties(changes, restart),
      (r) =>
        r.restarted
          ? "Zapisano zmiany. Serwer jest restartowany."
          : "Zapisano zmiany. Zadziałają po następnym restarcie serwera.",
    );
    if (!result) return;
    const { properties } = await adminActions.getProperties().catch(() => ({ properties: null }));
    if (properties) {
      setSaved(properties);
      setValues(Object.fromEntries(properties.map((p) => [p.key, p.value])));
    }
  }

  const needle = filter.trim().toLowerCase();
  const visible = saved?.filter((p) => p.key.includes(needle));

  return (
    <>
      <AdminNav onLogout={onLogout} />
      <main>
        <Container className="grid gap-4 pt-24 pb-6 md:gap-6 md:pt-28">
          <Panel title={`Właściwości serwera${saved ? ` (${saved.length})` : ""}`}>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Szukaj właściwości"
              placeholder="Szukaj właściwości"
            />
            {!saved && !feedback && <p className="text-ink-muted">Wczytuję server.properties…</p>}
            {visible?.length === 0 && <p className="text-ink-muted">Brak pasujących właściwości.</p>}
            {visible && visible.length > 0 && (
              <div>
                <SettingsHeader names={["Właściwość", "Opis", "Wartość"]} />
                <ul className="m-0 list-none p-0">
                  {visible.map((property) => (
                    <PropertyRow
                      key={property.key}
                      property={property}
                      value={values[property.key] ?? ""}
                      disabled={pending}
                      onChange={(value) => setValues((prev) => ({ ...prev, [property.key]: value }))}
                    />
                  ))}
                </ul>
              </div>
            )}
          </Panel>

          {/* Stays in view while scrolling a long list; on phones it would cover too much of the screen. */}
          <Card as="div" elevated className="z-10 grid gap-3 p-3 sm:sticky sm:bottom-4">
            <FeedbackLine feedback={feedback} />
            <p className="text-sm text-ink-muted">
              {changedCount === 0 ? "Brak zmian." : `Zmienione właściwości: ${changedCount}.`}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                size="sm"
                wrapperClassName="w-full"
                className="w-full"
                disabled={pending || changedCount === 0}
                onClick={() => void save(false)}
              >
                Zapisz bez restartu
              </Button>
              <Button
                size="sm"
                wrapperClassName="w-full"
                className="w-full"
                disabled={pending || changedCount === 0}
                onClick={() => void save(true)}
              >
                Zapisz i restartuj
              </Button>
              <Button
                size="sm"
                variant="secondary"
                wrapperClassName="w-full"
                className="w-full"
                onClick={() => router.push("/admin")}
              >
                Anuluj
              </Button>
            </div>
          </Card>
        </Container>
      </main>
    </>
  );
}

interface PropertyRowProps {
  property: ServerProperty;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

function PropertyRow({ property, value, disabled, onChange }: PropertyRowProps) {
  const { key, locked } = property;
  const choices = PROPERTY_CHOICES[key];
  const isBoolean = /^(true|false)$/.test(property.value);
  const description = describeProperty(key) ?? "Brak opisu.";

  return (
    <SettingRow
      name={key}
      description={
        locked ? `${description} Zarządzane przez konfigurację stosu, tylko do odczytu.` : description
      }
    >
      {isBoolean && !locked ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          aria-pressed={value === "true"}
          onClick={() => onChange(value === "true" ? "false" : "true")}
        >
          {value === "true" ? "Włączone" : "Wyłączone"}
        </Button>
      ) : (
        <>
          <Input
            className="w-full"
            value={value}
            readOnly={locked}
            disabled={disabled && !locked}
            aria-disabled={locked || undefined}
            onChange={(e) => onChange(e.target.value)}
            list={choices ? `choices-${key}` : undefined}
            autoComplete="off"
            spellCheck={false}
            aria-label={`Wartość ${key}`}
          />
          {choices && (
            <datalist id={`choices-${key}`}>
              {choices.map((choice) => (
                <option key={choice} value={choice} />
              ))}
            </datalist>
          )}
        </>
      )}
    </SettingRow>
  );
}
