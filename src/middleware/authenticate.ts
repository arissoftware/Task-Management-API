import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer "))
    return next(new ApiError(401, "Authentication required", "AUTH_REQUIRED"));

  try {
    req.user = { userId: verifyAccessToken(header.slice(7)).sub };

    return next();
  } catch {
    return next(
      new ApiError(401, "Invalid or expired access token", "INVALID_TOKEN"),
    );
  }
};
