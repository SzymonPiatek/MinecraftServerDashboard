"use client";

import { SERVER_CONTROL_ACTIONS, type ServerControlAction, type ServiceState } from "@mcd/shared";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-api";
import { Badge, Dot } from "../ui/badge";
import { Button } from "../ui/button";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";
import { useAction } from "./use-action";

const STATE_LABEL: Record<ServiceState, string> = {
  active: "Działa",
  inactive: "Zatrzymany",
  failed: "Awaria",
  unknown: "Nieznany",
};

const ACTION_LABEL: Record<ServerControlAction, string> = {
  start: "Start",
  stop: "Stop",
  restart: "Restart",
};

const CONFIRM: Partial<Record<ServerControlAction, string>> = {
  stop: "Zatrzymać serwer? Gracze zostaną rozłączeni.",
  restart: "Zrestartować serwer? Gracze zostaną rozłączeni.",
};

const POLL_MS = 10_000;

export function ServerPanel() {
  const [state, setState] = useState<ServiceState | null>(null);
  const { pending, feedback, run } = useAction();

  useEffect(() => {
    async function refresh() {
      try {
        setState((await adminFetch<{ state: ServiceState }>("/admin/server")).state);
      } catch {
        setState("unknown");
      }
    }

    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  async function control(action: ServerControlAction) {
    const confirmation = CONFIRM[action];
    if (confirmation && !window.confirm(confirmation)) return;
    const result = await run(
      () => adminFetch<{ state: ServiceState }>(`/admin/server/${action}`, { method: "POST" }),
      () => `Wykonano: ${ACTION_LABEL[action]}.`,
    );
    if (result) setState(result.state);
  }

  return (
    <Panel
      title="Serwer"
      actions={
        <Badge tone="muted">
          <Dot
            state={
              state === "active" ? "online" : state === null || state === "unknown" ? "unknown" : "offline"
            }
          />
          {state ? STATE_LABEL[state] : "Sprawdzam…"}
        </Badge>
      }
    >
      <div className="flex flex-wrap gap-3">
        {SERVER_CONTROL_ACTIONS.map((action) => (
          <Button
            key={action}
            variant={action === "start" ? "primary" : "secondary"}
            size="sm"
            disabled={pending}
            onClick={() => void control(action)}
          >
            {ACTION_LABEL[action]}
          </Button>
        ))}
      </div>
      <FeedbackLine feedback={feedback} />
    </Panel>
  );
}
