import { ApiError, FALLBACK_ERROR, NETWORK_ERROR, isAbortError } from "./errors";

export const API_BASE = "/api";

/** Fired when a call is rejected with 401, so the session gate can drop back to the login form. */
export const SESSION_EXPIRED_EVENT = "admin:session-expired";

export interface ApiRequest {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  /** Message used when the server's error response carries none. */
  fallbackError?: string;
  /** Set to false for calls where 401 is an expected answer (e.g. wrong credentials). */
  expireSessionOn401?: boolean;
}

function buildUrl(path: string, query: ApiRequest["query"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return `${API_BASE}${path}${search ? `?${search}` : ""}`;
}

/** Typed JSON client: normalises failures into `ApiError` and broadcasts session expiry. */
export async function apiFetcher<T = void>(path: string, request: ApiRequest = {}): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    signal,
    fallbackError = FALLBACK_ERROR,
    expireSessionOn401 = true,
  } = request;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      signal,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(0, NETWORK_ERROR);
  }

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { error?: string } | null;
    if (res.status === 401 && expireSessionOn401) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    throw new ApiError(res.status, payload?.error ?? fallbackError);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
