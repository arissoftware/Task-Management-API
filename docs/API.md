# API reference

Base path: `/api/v1`

## Authentication
- `POST /auth/register` — `{ "fullName": "Ada Lovelace", "email": "ada@example.com", "password": "a-long-password" }` → 201, user, accessToken, refreshToken.
- `POST /auth/login` — `{ "email": "ada@example.com", "password": "a-long-password" }` → 200, tokens and user.
- `POST /auth/refresh` — `{ "refreshToken": "..." }` → 200, rotated tokens.
- `POST /auth/logout` — `{ "refreshToken": "..." }` → 204.
- `GET /auth/me` — requires `Authorization: Bearer <accessToken>`.

## Tasks (all require Bearer access token)
- `POST /tasks` — create task. Fields: title (required), description, status, priority, dueDate.
- `GET /tasks` — list tasks. Query: `page`, `limit` (max 100), `status`, `priority`, `search`, `sortBy`, `order`.
- `GET /tasks/:id` — get one owned task.
- `PATCH /tasks/:id` — partial update; at least one field required.
- `DELETE /tasks/:id` — soft-delete, returns 204.
- `GET /tasks/stats` — total, pending, inProgress, completed, overdue counts.

Allowed status values: `Pending`, `InProgress`, `Completed`. Allowed priorities: `Low`, `Medium`, `High`. Allowed sort fields: `createdAt`, `updatedAt`, `dueDate`, `priority`, `title`.

## Error shape
`{ "success": false, "code": "...", "message": "..." }`. Validation errors include an `errors` array with each invalid field and its message.
