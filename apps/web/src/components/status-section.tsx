"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { useServerData } from "./server-data";
import { cn } from "@/lib/cn";
import { Avatar, AVATAR_TINTS } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Container, Section, SectionHead } from "./ui/section";

function tintFor(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

/** Bare skin head from mc-heads.net (no slot frame); falls back to the lettered slot for unknown (e.g. offline-mode) nicknames. */
function PlayerAvatar({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <Avatar tint={tintFor(name)} className="size-10">{name.charAt(0).toUpperCase()}</Avatar>;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external 8x8 skin head, no optimisation wanted
    <img
      src={`https://mc-heads.net/avatar/${encodeURIComponent(name)}/40`}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-10 [image-rendering:pixelated]"
    />
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 sm:block">
      <dt className="text-sm whitespace-nowrap text-ink-muted">{label}</dt>
      <dd className="m-0 flex min-w-0 items-center gap-2 font-mono text-lg font-medium whitespace-nowrap">
        {value}
      </dd>
    </div>
  );
}

function PlayerHead() {
  return <Image src="/status/player_head.png" alt="" width={96} height={96} unoptimized className="size-8" />;
}

function PingIcon({ reachable }: { reachable: boolean }) {
  return (
    <Image
      src={reachable ? "/status/server_ping.png" : "/status/server_unreachable.png"}
      alt={reachable ? "Serwer odpowiada" : "Serwer niedostępny"}
      width={10}
      height={7}
      unoptimized
      className="h-[21px] w-[30px] [image-rendering:pixelated]"
    />
  );
}

export function StatusSection() {
  const { status, players, unreachable } = useServerData();
  const loading = !status && !unreachable;

  return (
    <Section id="status">
      <Container>
        <SectionHead
          nowrap
          title="Status na żywo"
          description={
            <>
              <span className="sm:hidden">Dane odświeżają się same.</span>
              <span className="max-sm:hidden">Dane odświeżają się same co kilkanaście sekund.</span>
            </>
          }
        />

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card
            as="article"
            tone="muted"
            padding="lg"
            elevated
            interactive
            className="@container grid content-start gap-6 max-md:p-4"
          >
            <h3
              className={cn(
                "text-[min(var(--text-display),14cqw)] leading-none whitespace-nowrap",
                status?.online && "underline decoration-online decoration-[0.12em] underline-offset-[0.12em]",
              )}
            >
              {loading
                ? "..."
                : unreachable && !status
                  ? "Brak danych"
                  : status?.online
                    ? "Online"
                    : "Offline"}
            </h3>
            <dl className="m-0 grid gap-3 sm:grid-cols-3 sm:gap-4">
              <Stat
                label="Gracze"
                value={
                  <>
                    <PlayerHead />
                    {status?.online ? `${status.playersOnline}/${status.playersMax}` : "—"}
                  </>
                }
              />
              <Stat
                label="Ping"
                value={
                  <>
                    <PingIcon reachable={!!status?.online} />
                    {status?.online && status.pingMs !== null ? `${Math.round(status.pingMs)} ms` : "—"}
                  </>
                }
              />
              <Stat label="Wersja" value={<span className="truncate">{status?.version ?? "—"}</span>} />
            </dl>
            <p className="rounded-input border-[1.5px] border-dashed border-ink-muted bg-paper p-4 font-mono text-sm">
              {status?.motd || "Brak opisu serwera."}
            </p>
            {unreachable && (
              <p className="text-[min(0.875rem,4.4cqw)] font-semibold whitespace-nowrap" role="alert">
                Nie udało się odświeżyć danych.
                <span className="max-sm:hidden"> Spróbuję ponownie za chwilę.</span>
              </p>
            )}
          </Card>

          <Card
            as="article"
            tone="muted"
            padding="lg"
            elevated
            interactive
            className="@container grid content-start gap-6 max-md:p-4"
          >
            <h3 className="text-[min(2rem,9cqw)] whitespace-nowrap">Kto gra teraz</h3>
            {players && players.players.length > 0 ? (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {players.players.map((name) => (
                  <li key={name}>
                    <Badge leading="avatar" className="gap-3 pr-3 text-xl whitespace-nowrap">
                      <PlayerAvatar name={name} />
                      {name}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[min(1.25rem,5.2cqw)] whitespace-nowrap text-ink-muted">
                {status?.online ? "Nikogo nie ma. Bądź pierwszy!" : "Lista graczy jest teraz niedostępna."}
              </p>
            )}
          </Card>
        </div>
      </Container>
    </Section>
  );
}
