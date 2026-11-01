import pg from "pg";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 15_000,
});

pool.on("error", (error) =>
  logger.error({ err: error }, "Unexpected idle PostgreSQL client error"),
);

export async function checkDatabaseConnection(): Promise<void> {
  await pool.query("SELECT 1");
}
