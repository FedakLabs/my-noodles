# Web (`apps/web`)

Next.js App Router storefront — MUI, next-intl, TanStack Query.

## Prerequisites

- Node.js `>= 22`
- pnpm `11.8.0` (see root `packageManager`)
- Running API on `http://localhost:3001` (see [`apps/api/README.md`](../api/README.md))

## Setup

From the **repo root**:

```bash
# 1. Install workspace dependencies (once for the whole monorepo)
pnpm install

# 2. Configure env
cp apps/web/.env.example apps/web/.env.local
# Defaults point at local API + site:
#   NEXT_PUBLIC_API_URL=http://localhost:3001
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Ensure the API is set up (Postgres, migrations, seed) and running before browsing catalog pages — see [`apps/api/README.md`](../api/README.md).

## Run

```bash
# from repo root
pnpm dev:web
# or: pnpm nx run web:dev
```

Storefront: `http://localhost:3000`

## Useful commands

| Command                            | Description                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `pnpm nx run web:dev`              | Next.js dev server                                       |
| `pnpm nx run web:build`            | Production build                                         |
| `pnpm nx run web:generate:clients` | Regenerate API client from live OpenAPI (API must be up) |
| `pnpm nx run web:validate`         | Format, lint, type-check, test, knip                     |
| `pnpm nx run web:e2e`              | Playwright e2e                                           |

## Env notes

- Use `.env.local` for local overrides (gitignored).
- `NEXT_PUBLIC_*` values are baked into the client bundle — restart `dev` after changing them.
