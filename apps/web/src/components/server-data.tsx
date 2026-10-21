"use client";

import type { OnlinePlayers, ServerStatus } from "@mcd/shared";
import { createContext, useContext, useState, type ReactNode } from "react";
import { usePolling } from "@/hooks/use-polling";
import { publicActions } from "@/lib/api";

const REFRESH_MS = 15_000;

interface ServerData {
  status: ServerStatus | null;
  players: OnlinePlayers | null;
  unreachable: boolean;
}

const ServerDataContext = createContext<ServerData>({ status: null, players: null, unreachable: false });

export function ServerDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ServerData>({ status: null, players: null, unreachable: false });

  usePolling(async (signal) => {
    try {
      const [status, players] = await Promise.all([
        publicActions.getStatus({ signal }),
        publicActions.getPlayers({ signal }),
      ]);
      setData({ status, players, unreachable: false });
    } catch (e) {
      if (signal.aborted) throw e;
      setData((prev) => ({ ...prev, unreachable: true }));
    }
  }, REFRESH_MS);

  return <ServerDataContext value={data}>{children}</ServerDataContext>;
}

export const useServerData = () => useContext(ServerDataContext);
