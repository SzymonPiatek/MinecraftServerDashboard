export const FALLBACK_ERROR = "Coś poszło nie tak. Spróbuj ponownie.";
export const NETWORK_ERROR = "Brak połączenia z serwerem.";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isAbortError = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

export const errorMessage = (error: unknown) => (error instanceof ApiError ? error.message : FALLBACK_ERROR);
