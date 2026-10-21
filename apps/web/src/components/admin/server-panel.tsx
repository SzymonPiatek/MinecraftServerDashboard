"use client";

import { SERVER_CONTROL_ACTIONS, type ServerControlAction, type ServiceState } from "@mcd/shared";
import { useState } from "react";
import { useAction } from "@/hooks/use-action";
import { usePolling } from "@/hooks/use-polling";
import { adminActions } from "@/lib/api";
import { Badge, Dot } from "../ui/badge";
import { Button } from "../ui/button";
import { FeedbackLine } from "./feedback-line";
import { Panel } from "./panel";

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

export function ServerPanel({ className }: { className?: string }) {
  const [state, setState] = useState<ServiceState | null>(null);
  const { pending, feedback, run } = useAction();

  usePolling(async (signal) => {
    try {
      setState((await adminActions.getServerState({ signal })).state);
    } catch (e) {
      if (signal.aborted) throw e;
      setState("unknown");
    }
  }, POLL_MS);

  async function control(action: ServerControlAction) {
    const confirmation = CONFIRM[action];
    if (confirmation && !window.confirm(confirmation)) return;
    const result = await run(
      () => adminActions.controlServer(action),
      () => `Wykonano: ${ACTION_LABEL[action]}.`,
    );
    if (result) setState(result.state);
  }

  return (
    <Panel
      title="Serwer"
      className={className}
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
      <div className="grid grid-cols-3 gap-3">
        {SERVER_CONTROL_ACTIONS.map((action) => (
          <Button
            key={action}
            variant={action === "start" ? "primary" : "secondary"}
            size="sm"
            wrapperClassName="w-full"
            className="w-full"
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
