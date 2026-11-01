# Learn this project in your editor

Do not try to memorize the whole codebase. Follow one request from top to bottom and ask what responsibility each layer owns.

## Recommended editor walkthrough

### 1. Configuration and startup
- `src/config/env.ts`: validates environment variables at startup. Invalid configuration stops the process early.
- `src/config/logger.ts`: creates a structured Pino logger and redacts sensitive fields.
- `src/db/pool.ts`: creates a bounded PostgreSQL connection pool.
- `src/server.ts`: checks the database, starts listening, and closes HTTP/DB resources on SIGINT or SIGTERM.
- `src/app.ts`: configures Express independently of listening, so Supertest can import it.

### 2. Follow registration
Open these files in order: `src/routes/auth.routes.ts` → `src/controllers/auth.controller.ts` → `src/validators/auth.validator.ts` → `src/services/auth.service.ts` → `src/repositories/user.repository.ts` and `src/repositories/auth.repository.ts` → `src/utils/tokens.ts`.

The route selects the controller. The controller parses the body. The service applies duplicate-account and password-hashing rules. The repository runs parameterized SQL. The token utility creates the access JWT and opaque refresh token. The database stores only the refresh-token hash.

### 3. Follow login and refresh
Login loads the account by normalized email, compares the submitted password against the bcrypt hash, then returns an access token and refresh token. Refresh hashes the submitted opaque token, checks its database record and expiry, deletes the old token, and issues a replacement.

### 4. Follow a task request
Open `src/routes/task.routes.ts` → `src/middleware/authenticate.ts` → `src/controllers/task.controller.ts` → `src/validators/task.validator.ts` → `src/services/task.service.ts` → `src/repositories/task.repository.ts`.

The repository is the only layer that knows SQL. The authenticated user ID is included in every task query, preventing one user from accessing another user's tasks.

### 5. Understand query safety
`task.repository.ts` builds optional WHERE clauses with positional parameters. User values never become SQL text. The ORDER BY column is selected from a fixed object, and direction is reduced to ASC or DESC. This is how sorting can be dynamic without opening an SQL-injection path.

### 6. Understand error flow
Controllers forward errors to Express 5's error pipeline. `src/middleware/error-handler.ts` maps expected API errors, validation failures, and unique-constraint conflicts to safe HTTP responses. Unexpected errors are logged and return a generic 500 response.

### 7. Tests
`tests/app.test.ts` tests health, 404, validation, and authentication boundaries without inserting database records. Run `npm test`. Database-dependent integration tests should use a dedicated disposable database before being added.

## Suggested learning sequence
1. Configuration and startup.
2. Registration and login.
3. JWT authentication and refresh-token rotation.
4. Task create/list/get/update/soft-delete.
5. Filtering, search, sorting, pagination, and statistics.
6. PostgreSQL migrations, indexes, and query plans.
7. Security middleware and production operations.

For each file, explain: what enters this file, what it owns, what it calls, what it returns, and what it deliberately does not do.
