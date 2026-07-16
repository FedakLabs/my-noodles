# API (`apps/api`)

NestJS storefront API — Postgres via TypeORM, OpenAPI at `/api/docs`.

## Prerequisites

- Node.js `>= 22`
- pnpm `11.8.0` (see root `packageManager`)
- Docker (Postgres via root `docker-compose.yml`)

## Setup

From the **repo root**:

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Start Postgres (and optional OTEL stack)
docker compose up -d postgres
# Optional observability: docker compose up -d

# 3. Configure env
cp apps/api/.env.example apps/api/.env
# Fill required secrets in apps/api/.env:
#   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
#   NOVA_POSHTA_API_KEY, UKRPOSHTA_API_KEY

# 4. Apply migrations
pnpm nx run api:migration:run

# 5. Seed local catalog data
pnpm nx run api:seed
```

## Run

```bash
# from repo root
pnpm dev:api
# or: pnpm nx run api:dev
```

API listens on `http://localhost:3001` (see `PORT` in `.env`).

- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs-json`

## Useful commands

| Command                            | Description                               |
| ---------------------------------- | ----------------------------------------- |
| `pnpm nx run api:migration:run`    | Apply pending migrations                  |
| `pnpm nx run api:migration:revert` | Revert last migration                     |
| `pnpm nx run api:seed`             | Seed products / feed data                 |
| `pnpm nx run api:generate:openapi` | Write OpenAPI JSON from running API build |
| `pnpm nx run api:validate`         | Format, lint, type-check, test, knip      |

## Env notes

- Layering: `.env` → `.env.{NODE_ENV}` → `.env.local` (later wins).
- `.env.local` is gitignored — use it for personal overrides.
- Delivery + Telegram keys are validated at boot; missing values fail fast.
