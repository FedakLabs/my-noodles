# Admin panel

Vite + TanStack Router SPA for order management.

## Dev

```bash
pnpm nx run admin:dev
```

Runs on http://localhost:3002. Set `VITE_API_URL` and `VITE_AUTH_API_URL` in `.env` (see `.env.example`).

## Auth

Users are created directly in the database; credentials are never runtime configuration.

Login stores access + refresh tokens via Zustand persist. The admin OpenAPI client attaches Bearer tokens and refreshes on 401.
