# Task Management API Pro

A TypeScript, Express 5, PostgreSQL REST API designed as a practical backend engineering project. It includes layered architecture, Zod validation, JWT access tokens, rotating opaque refresh tokens, bcrypt password hashing, task CRUD, filtering, search, sorting, pagination, statistics, soft deletion, SQL migrations, security middleware, Pino logging, Docker, and a small safe automated test suite.

## Requirements
- Node.js 22 or newer
- PostgreSQL 15 or newer
- npm

## Setup
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` to your own values. Use two different random secrets of at least 32 characters.
3. Create a PostgreSQL database and role matching your connection string.
4. Install dependencies: `npm install` (this creates your local `package-lock.json`; commit it for reproducible installs).
5. Apply migrations: `npm run db:migrate`.
6. Start development: `npm run dev`.

Generate secrets with `openssl rand -base64 48`. Never commit `.env`.

## Commands
- `npm run dev` — development server with reload
- `npm run typecheck` — strict TypeScript check
- `npm run build` — compile to `dist/`
- `npm start` — run compiled server
- `npm test` — run safe HTTP tests
- `npm run db:migrate` — apply unapplied SQL migrations

## Docker
Review and change the example credentials in `docker-compose.yml` and `.env` before use. Then run `docker compose up --build`. Apply migrations in a separate terminal with `npm run db:migrate` (or run them as a controlled release step).

## Important production checklist
- Use TLS at the reverse proxy/load balancer.
- Set exact frontend origins in `CORS_ORIGINS`.
- Store secrets in a secret manager, not in source control.
- Configure PostgreSQL backups, monitoring, and least-privilege credentials.
- Run migrations as a release job, not concurrently in every API replica.
- Configure proxy trust only when deployed behind a known trusted proxy.
- Add dedicated-database integration tests before changing schema or release workflows.
- Review rate limits and token lifetimes against real traffic and threat models.

## Documentation
- [Architecture](docs/ARCHITECTURE.md)
- [Learning guide: follow the code in your editor](docs/LEARNING-GUIDE.md)
- [API reference](docs/API.md)

This is a strong learning and starter project, not a claim of security certification or production validation. Review dependencies, run the checks in your environment, and adapt operational settings before public deployment.
