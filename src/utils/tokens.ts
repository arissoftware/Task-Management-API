import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessPayload {
  sub: string;
}

export function signAccessToken(userId: string): string {
  return jwt.sign({}, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: env.ACCESS_TOKEN_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ["HS256"],
  });

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    !/^\d+$/.test(decoded.sub)
  )
    throw new Error("Invalid token payload");
  return { sub: decoded.sub };
}

export function createRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
