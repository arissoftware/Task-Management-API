import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_SECONDS: z.coerce.number().int().min(60).max(3600).default(900),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", z.flattenError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const allowedOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
