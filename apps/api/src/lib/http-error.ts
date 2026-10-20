export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string) {
    return new HttpError(400, message);
  }
  static unauthorized(message = "Authentication required") {
    return new HttpError(401, message);
  }
  static notFound(message = "Not found") {
    return new HttpError(404, message);
  }
  static conflict(message: string) {
    return new HttpError(409, message);
  }
  static unavailable(message: string) {
    return new HttpError(503, message);
  }
}
