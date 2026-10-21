"use client";

import Image from "next/image";
import type { ReactNode } from "react";
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

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="m-0 flex items-center gap-2 font-mono text-lg font-medium wrap-anywhere">{value}</dd>
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
        <SectionHead title="Status na żywo" description="Dane odświeżają się same co kilkanaście sekund." />

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card
            as="article"
            tone="muted"
            padding="lg"
            elevated
            interactive
            className="grid content-start gap-6"
          >
            <h3
              className={cn(
                "text-display leading-none",
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
            <dl className="m-0 grid grid-cols-3 gap-4">
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
              <Stat label="Wersja" value={status?.version ?? "—"} />
            </dl>
            <p className="rounded-input border-[1.5px] border-dashed border-ink-muted bg-paper p-4 font-mono text-sm">
              {status?.motd || "Brak opisu serwera."}
            </p>
            {unreachable && (
              <p className="text-sm font-semibold" role="alert">
                Nie udało się odświeżyć danych. Spróbuję ponownie za chwilę.
              </p>
            )}
          </Card>

          <Card
            as="article"
            tone="muted"
            padding="lg"
            elevated
            interactive
            className="grid content-start gap-6"
          >
            <h3 className="text-2xl">Kto gra teraz</h3>
            {players && players.players.length > 0 ? (
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {players.players.map((name) => (
                  <li key={name}>
                    <Badge leading="avatar" className="text-base">
                      <Avatar tint={tintFor(name)}>{name.charAt(0).toUpperCase()}</Avatar>
                      {name}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg text-ink-muted">
                {status?.online ? "Nikogo nie ma. Bądź pierwszy!" : "Lista graczy jest teraz niedostępna."}
              </p>
            )}
          </Card>
        </div>
      </Container>
    </Section>
  );
}
