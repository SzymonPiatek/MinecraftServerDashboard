"use client";

import type { AdminSession } from "@mcd/shared";
import { useCallback, useEffect, useState } from "react";
import { SESSION_EXPIRED_EVENT, authActions } from "@/lib/api";

export type Session = { phase: "loading" } | { phase: "anonymous" } | { phase: "admin"; admin: AdminSession };

export function useAdminSession() {
  const [session, setSession] = useState<Session>({ phase: "loading" });

  useEffect(() => {
    authActions
      .me()
      .then((admin) => setSession({ phase: "admin", admin }))
      .catch(() => setSession({ phase: "anonymous" }));
  }, []);

  useEffect(() => {
    const expire = () => setSession({ phase: "anonymous" });
    window.addEventListener(SESSION_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
  }, []);

  const signIn = useCallback((admin: AdminSession) => setSession({ phase: "admin", admin }), []);

  const signOut = useCallback(async () => {
    await authActions.logout().catch(() => undefined);
    setSession({ phase: "anonymous" });
  }, []);

  return { session, signIn, signOut };
}
