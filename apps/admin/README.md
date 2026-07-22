# Admin panel

Vite + TanStack Router SPA for order management.

## Dev

```bash
pnpm nx run admin:dev
```

Runs on http://localhost:3002. Set `ADMIN_API_URL` in `.env` (see `.env.example`).

## Auth

Seed creates an admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (see `apps/api/.env.example`). Local defaults:

```text
Email:    admin@my-noodles.local
Password: changeme123
```

Login stores access + refresh tokens via Zustand persist. The admin OpenAPI client attaches Bearer tokens and refreshes on 401.
