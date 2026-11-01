// Tests that do not connect to PostgreSQL still need valid configuration at import time.
process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3000";
process.env.DATABASE_URL ??= "postgresql://unused:unused@127.0.0.1:5432/unused";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-at-least-32-characters-long";
process.env.ACCESS_TOKEN_SECONDS ??= "900";
process.env.REFRESH_TOKEN_DAYS ??= "30";
process.env.BCRYPT_ROUNDS ??= "12";
process.env.CORS_ORIGINS ??= "http://localhost:5173";
process.env.LOG_LEVEL ??= "silent";
