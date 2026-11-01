import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool } from "./pool.js";
import { logger } from "../config/logger.js";

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

async function migrate(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    const applied = await client.query<{ name: string }>(
      "SELECT name FROM schema_migrations",
    );
    const appliedNames = new Set(applied.rows.map((row) => row.name));
    const files = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();
    for (const name of files) {
      if (appliedNames.has(name)) continue;
      const sql = await readFile(path.join(migrationsDir, name), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations(name) VALUES ($1)", [
        name,
      ]);
      logger.info({ migration: name }, "Database migration applied");
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error: unknown) => {
  logger.error({ err: error }, "Database migration failed");
  process.exitCode = 1;
});
