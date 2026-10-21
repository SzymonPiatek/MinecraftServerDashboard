export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Fired when an admin call is rejected with 401, so the session gate can drop back to the login form. */
export const SESSION_EXPIRED_EVENT = "admin:session-expired";

const FALLBACK_ERROR = "Coś poszło nie tak. Spróbuj ponownie.";

export async function adminFetch<T = void>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, "Brak połączenia z serwerem.");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (res.status === 401 && path !== "/auth/login") window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    throw new ApiError(res.status, body?.error ?? FALLBACK_ERROR);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const errorMessage = (error: unknown) => (error instanceof ApiError ? error.message : FALLBACK_ERROR);
