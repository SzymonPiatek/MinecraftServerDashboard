/** Caches the result of an async loader for `ttlMs`, sharing one in-flight call between concurrent callers. */
export function cacheAsync<T>(loader: () => Promise<T>, ttlMs: number): () => Promise<T> {
  let value: { data: T; expiresAt: number } | undefined;
  let inFlight: Promise<T> | undefined;

  return async () => {
    if (value && value.expiresAt > Date.now()) return value.data;

    inFlight ??= loader()
      .then((data) => {
        value = { data, expiresAt: Date.now() + ttlMs };
        return data;
      })
      .finally(() => {
        inFlight = undefined;
      });

    return inFlight;
  };
}
