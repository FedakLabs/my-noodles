# Admin panel

Vite + TanStack Router SPA for order management.

## Dev

```bash
pnpm nx run admin:dev
```

Runs on http://localhost:3002. Set `VITE_API_URL` and `VITE_AUTH_API_URL` in `.env` (see `.env.example`).

## Auth

The local-only API seed creates this development admin:

```text
Email:    admin@my-noodles.local
Password: changeme123
```

Production users are created directly in the database; these seed credentials are never runtime configuration.

Login stores access + refresh tokens via Zustand persist. The admin OpenAPI client attaches Bearer tokens and refreshes on 401.
