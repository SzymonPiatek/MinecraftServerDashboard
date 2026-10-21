"use client";

import { useEffect, useRef } from "react";
import { isAbortError } from "@/lib/api";

/**
 * Runs `task` immediately and then every `intervalMs` while the tab is visible.
 * The signal is aborted on unmount, and aborted rejections are swallowed.
 */
export function usePolling(task: (signal: AbortSignal) => Promise<void>, intervalMs: number) {
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    const controller = new AbortController();
    const tick = () =>
      taskRef.current(controller.signal).catch((error: unknown) => {
        if (!isAbortError(error)) throw error;
      });

    void tick();
    const timer = setInterval(() => {
      if (!document.hidden) void tick();
    }, intervalMs);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [intervalMs]);
}
