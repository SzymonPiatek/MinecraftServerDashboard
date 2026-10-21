"use client";

import type { OnlinePlayers, ServerStatus } from "@mcd/shared";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const REFRESH_MS = 15_000;

interface ServerData {
  status: ServerStatus | null;
  players: OnlinePlayers | null;
  unreachable: boolean;
}

const ServerDataContext = createContext<ServerData>({ status: null, players: null, unreachable: false });

async function fetchJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal });
  if (!res.ok) throw new Error(`${path} responded with ${res.status}`);
  return (await res.json()) as T;
}

export function ServerDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ServerData>({ status: null, players: null, unreachable: false });

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const [status, players] = await Promise.all([
          fetchJson<ServerStatus>("/api/status", controller.signal),
          fetchJson<OnlinePlayers>("/api/players", controller.signal),
        ]);
        setData({ status, players, unreachable: false });
      } catch {
        if (!controller.signal.aborted) setData((prev) => ({ ...prev, unreachable: true }));
      }
    }

    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, REFRESH_MS);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  return <ServerDataContext value={data}>{children}</ServerDataContext>;
}

export const useServerData = () => useContext(ServerDataContext);
