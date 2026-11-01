import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../errors/api-error.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof ApiError)
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
    });

  if (error instanceof ZodError)
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Request validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

  if (error instanceof Error && error.message === "Origin not allowed by CORS")
    return res.status(403).json({
      success: false,
      code: "CORS_ORIGIN_DENIED",
      message: "Origin is not allowed",
    });

  const pgCode = (error as { code?: string })?.code;

  if (pgCode === "23505")
    return res.status(409).json({
      success: false,
      code: "CONFLICT",
      message: "A record with that unique value already exists",
    });

  logger.error({ err: error }, "Unhandled request error");
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    ...(env.NODE_ENV === "development" && error instanceof Error
      ? { detail: error.message }
      : {}),
  });
};
