# Architecture and request lifecycle

The application uses a layered architecture:

1. **Routes** map HTTP methods and paths to controllers and apply route-level middleware.
2. **Middleware** handles cross-cutting concerns: authentication, security headers, CORS, rate limiting, request logging, and error handling.
3. **Controllers** translate HTTP input into application calls and format HTTP responses. They should not contain SQL.
4. **Validators** define trusted input contracts with Zod.
5. **Services** enforce business rules and coordinate work.
6. **Repositories** own SQL and map database rows into domain objects.
7. **PostgreSQL** persists users, hashed refresh tokens, and tasks.

Typical authenticated task request: HTTP request → Helmet/CORS/JSON/logger → route authentication → controller → Zod parse → service → repository → parameterized SQL → PostgreSQL → JSON response.

## Security decisions
- Passwords are hashed with bcrypt; plaintext passwords are never stored.
- Access JWTs are short-lived and signed with HS256. Only the `sub` claim is trusted after verification and shape validation.
- Refresh tokens are random opaque values; only SHA-256 hashes are stored. Refresh tokens rotate on use.
- SQL values are parameterized. Dynamic ORDER BY fragments come only from fixed allowlists.
- Task reads, updates, and deletes are scoped by both task ID and authenticated user ID.
- Helmet, explicit CORS origins, JSON body limits, and authentication rate limiting are enabled.
- Logs redact authorization headers, passwords, and refresh tokens.

## Operational notes
The API is stateless apart from PostgreSQL. Redis and BullMQ are intentionally not required for this core task manager; add them only when there is a concrete caching or background-job requirement.
