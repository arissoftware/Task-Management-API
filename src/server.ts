import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { checkDatabaseConnection, pool } from "./db/pool.js";

async function start(): Promise<void> {
  await checkDatabaseConnection();

  const server = app.listen(env.PORT, () =>
    logger.info({ port: env.PORT }, "HTTP server listening"),
  );

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Graceful shutdown started");
    server.close(async (error) => {
      if (error) logger.error({ err: error }, "HTTP server close failed");
      try {
        await pool.end();
        logger.info("PostgreSQL pool closed");
        process.exit(error ? 1 : 0);
      } catch (e) {
        logger.error({ err: e }, "Error closing PostgreSQL pool");
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch(async (error: unknown) => {
  logger.fatal({ err: error }, "Application startup failed");
  await pool.end();
  process.exit(1);
});
