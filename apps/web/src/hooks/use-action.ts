"use client";

import { useCallback, useState } from "react";
import { errorMessage } from "@/lib/api";

export interface ActionFeedback {
  tone: "ok" | "error";
  text: string;
}

/** Runs an async admin action, tracking the pending flag and a one-line result for the panel to show. */
export function useAction() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const run = useCallback(async <T>(action: () => Promise<T>, okText?: (result: T) => string) => {
    setPending(true);
    setFeedback(null);
    try {
      const result = await action();
      if (okText) setFeedback({ tone: "ok", text: okText(result) });
      return result;
    } catch (e) {
      setFeedback({ tone: "error", text: errorMessage(e) });
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  return { pending, feedback, run };
}
