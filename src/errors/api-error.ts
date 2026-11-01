export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = "REQUEST_ERROR",
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}
