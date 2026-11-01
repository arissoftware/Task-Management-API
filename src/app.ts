import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { allowedOrigins, env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { authRouter } from "./routes/auth.routes.js";
import { taskRouter } from "./routes/task.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: false,
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === "/health" },
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many authentication attempts. Try again later.",
  },
});

app.get("/health", (_req, res) =>
  res.status(200).json({ success: true, status: "ok" }),
);

app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/tasks", taskRouter);

app.use(notFound);
app.use(errorHandler);

if (env.NODE_ENV === "test") logger.info("Application running in test mode");
