# External setup requirements

Checklist of accounts, consoles, and env vars to prepare before the apps run. Copy each app’s `.env.example` → `.env` / `.env.local`, then fill blanks.

| Deeper runbook                                                       | Topic                                  |
| -------------------------------------------------------------------- | -------------------------------------- |
| [analytics-setup.md](./analytics-setup.md)                           | GTM + GA4 + Hotjar + consent           |
| [../devops/docs/secrets.md](../devops/docs/secrets.md)               | GitHub Environment `prod` secrets/vars |
| [../devops/docs/neon.md](../devops/docs/neon.md)                     | Neon pooled vs direct URLs             |
| [../devops/docs/observability.md](../devops/docs/observability.md)   | Sentry + Grafana OTLP                  |
| [../devops/docs/object-storage.md](../devops/docs/object-storage.md) | Hetzner S3 + CDN                       |

---

## Local MVP checklist

API fails fast at boot without Telegram, Tawk, and Nova Poshta.

- [ ] Node ≥ 22 + pnpm
- [ ] `docker compose up -d postgres` (root compose; matches `POSTGRES_*` defaults)
- [ ] Copy [`apps/api/.env.example`](../apps/api/.env.example) → `apps/api/.env` (optional `.env.local` overrides)
- [ ] Copy [`apps/web/.env.example`](../apps/web/.env.example) → `apps/web/.env.local`
- [ ] Copy [`apps/admin/.env.example`](../apps/admin/.env.example) → `apps/admin/.env`
- [ ] Telegram bot + chat → `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- [ ] Tawk.to property/widget + API key → `TAWK_*`
- [ ] Nova Poshta API key → `NOVA_POSHTA_API_KEY`
- [ ] Optional: GTM → `NEXT_PUBLIC_GTM_ID` ([analytics-setup.md](./analytics-setup.md))
- [ ] Optional: Sentry DSNs (api / web / admin)
- [ ] Optional: local OTEL — `docker compose up -d` (otel-lgtm) + `OTEL_ENABLED=true`

---

## Production checklist

- [ ] Neon project → `DATABASE_URL` (pooled) + `DATABASE_URL_DIRECT` (migrations)
- [ ] Hetzner Cloud + Object Storage → `HCLOUD_TOKEN`, `S3_*`
- [ ] Cloudflare (zone, API token, Pages project for admin) + Namecheap NS → Cloudflare
- [ ] Sentry projects ×3 (api / web / admin)
- [ ] Optional: Grafana Cloud OTLP
- [ ] Fill GitHub Environment **`prod`** per [secrets.md](../devops/docs/secrets.md)

---

## External services

| Service                | Purpose                         | Console / signup                                                           | Apps                          | Status                                   |
| ---------------------- | ------------------------------- | -------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| Postgres (Docker)      | Local DB                        | root `docker-compose.yml`                                                  | api                           | Required local                           |
| Neon                   | Prod Postgres                   | [console.neon.tech](https://console.neon.tech)                             | api                           | Prod                                     |
| Telegram Bot           | Order / alert notifications     | [@BotFather](https://t.me/BotFather)                                       | api                           | Required (boot)                          |
| Tawk.to                | Live chat + secure visitor HMAC | [dashboard.tawk.to](https://dashboard.tawk.to)                             | api (keys); web embed via API | Required (boot)                          |
| Nova Poshta            | Delivery lookups                | [developers.novaposhta.ua](https://developers.novaposhta.ua/documentation) | api                           | Required (boot)                          |
| Meest                  | Geo / localities (public)       | [publicapi.meest.com](https://publicapi.meest.com/#geo_localities)         | api                           | Optional base URL only (no key env)      |
| Ukrposhta              | Address classifier              | [dev.ukrposhta.ua](https://dev.ukrposhta.ua/documentation)                 | api                           | Optional base URL only (no key env)      |
| Google Tag Manager     | Storefront analytics container  | [tagmanager.google.com](https://tagmanager.google.com)                     | web                           | Optional                                 |
| GA4                    | Product analytics               | via GTM only (`G-…` not a Next env)                                        | web                           | Optional (console)                       |
| Hotjar                 | Session insight                 | via GTM only (Site ID not a Next env)                                      | web                           | Optional (console)                       |
| Sentry                 | Error reporting                 | [sentry.io](https://sentry.io) — separate projects                         | api, web, admin               | Optional                                 |
| Grafana Cloud OTLP     | Traces / metrics / logs         | Grafana Cloud → OTLP                                                       | api                           | Optional                                 |
| Hetzner Cloud          | VMs + LB                        | Hetzner Cloud → API tokens                                                 | infra                         | Prod                                     |
| Hetzner Object Storage | Media bucket (S3)               | Hetzner Object Storage                                                     | infra (+ api env)             | Prod — **Nest does not read `S3_*` yet** |
| Cloudflare             | DNS, proxy, Pages (admin), CDN  | Cloudflare dashboard                                                       | infra, admin deploy           | Prod                                     |
| Namecheap              | Domain registrar                | NS cutover only                                                            | —                             | Prod (no app env)                        |
| GHCR                   | Docker images                   | GitHub Packages                                                            | deploy                        | Prod (`GITHUB_TOKEN`)                    |

**Not in repo yet:** payments, transactional email/SMS, Redis (cache stub only), Meest client API token.

---

## Env vars by app

### `apps/web` → `.env.local`

Template: [`apps/web/.env.example`](../apps/web/.env.example)

| Variable                  | Required? | Where to get it            | Purpose                           |
| ------------------------- | --------- | -------------------------- | --------------------------------- |
| `NEXT_PUBLIC_API_URL`     | Yes       | Local/prod API origin      | Storefront API base               |
| `NEXT_PUBLIC_SITE_URL`    | Yes       | Public site origin         | SEO / absolute URLs               |
| `NEXT_PUBLIC_GTM_ID`      | Optional  | GTM → container ID `GTM-…` | Loads GTM; analytics off if unset |
| `NEXT_PUBLIC_SENTRY_DSN`  | Optional  | Sentry **web** project     | Browser errors                    |
| `NEXT_PUBLIC_APP_VERSION` | Optional  | CI sets from git sha       | Sentry release tag                |

### `apps/admin` → `.env`

Template: [`apps/admin/.env.example`](../apps/admin/.env.example)

| Variable            | Required? | Where to get it          | Purpose            |
| ------------------- | --------- | ------------------------ | ------------------ |
| `VITE_API_URL`      | Yes       | API origin               | Admin API client   |
| `VITE_AUTH_API_URL` | Yes       | API origin               | Auth client        |
| `VITE_SENTRY_DSN`   | Optional  | Sentry **admin** project | Browser errors     |
| `VITE_APP_VERSION`  | Optional  | CI sets from git sha     | Sentry release tag |

### `apps/api` → `.env` / `.env.local`

Template: [`apps/api/.env.example`](../apps/api/.env.example). Layering: `.env` → `.env.{NODE_ENV}` → `.env.local`.

#### Server

| Variable                | Required? | Where to get it            | Purpose                   |
| ----------------------- | --------- | -------------------------- | ------------------------- |
| `PORT`                  | Yes       | Local default `3001`       | HTTP listen               |
| `NODE_ENV`              | Optional  | `local` \| `dev` \| `prod` | Env layering + Sentry env |
| `APP_NAME`              | Optional  | Default `my-noodles-api`   | Identity / OTEL           |
| `APP_VERSION`           | Optional  | Default `dev`              | Sentry release            |
| `SHUTDOWN_TIMEOUT_MS`   | Optional  | Default `30000`            | Graceful shutdown         |
| `API_RESPONSE_DELAY_MS` | Optional  | Default `0`                | Dev artificial delay      |

#### Database

| Variable                                              | Required?                                | Where to get it               | Purpose                 |
| ----------------------------------------------------- | ---------------------------------------- | ----------------------------- | ----------------------- |
| `POSTGRES_HOST` / `PORT` / `USER` / `PASSWORD` / `DB` | Yes if no `DATABASE_URL`                 | Docker Compose defaults       | Local Postgres          |
| `DATABASE_URL`                                        | Yes in prod (instead of discrete fields) | Neon pooled connection string | Runtime DB              |
| `DATABASE_SSL`                                        | Optional                                 | Default true when URL set     | TLS                     |
| `DATABASE_LOGGING`                                    | Optional                                 | —                             | TypeORM logging         |
| `DATABASE_URL_DIRECT`                                 | CI migrations only                       | Neon **non-pooled** URL       | Not read by Nest Config |

#### Auth (admin bootstrap)

| Variable                  | Required?                              | Where to get it           | Purpose              |
| ------------------------- | -------------------------------------- | ------------------------- | -------------------- |
| `JWT_SECRET`              | Local default in code; **set in prod** | `openssl rand -base64 48` | JWT signing (min 16) |
| `JWT_ACCESS_TTL_SECONDS`  | Optional                               | Default `900`             | Access token TTL     |
| `JWT_REFRESH_TTL_SECONDS` | Optional                               | Default `2592000`         | Refresh token TTL    |
| `ADMIN_EMAIL`             | Local default; **set in prod**         | Your ops email            | Seeded admin         |
| `ADMIN_PASSWORD`          | Local default; **set in prod**         | Strong password (min 8)   | Seeded admin         |

#### Telegram / Tawk / delivery

| Variable                   | Required?  | Where to get it                                      | Purpose              |
| -------------------------- | ---------- | ---------------------------------------------------- | -------------------- |
| `TELEGRAM_BOT_TOKEN`       | Yes (boot) | [@BotFather](https://t.me/BotFather)                 | Bot API              |
| `TELEGRAM_CHAT_ID`         | Yes (boot) | Bot chat / getUpdates                                | Alert destination    |
| `TAWK_API_KEY`             | Yes (boot) | Tawk → Administration → Overview → API Key           | HMAC secure mode     |
| `TAWK_PROPERTY_ID`         | Yes (boot) | Tawk → Channels → Chat Widget URL                    | Embed path           |
| `TAWK_WIDGET_ID`           | Yes (boot) | Same widget URL path                                 | Embed path           |
| `NOVA_POSHTA_API_KEY`      | Yes (boot) | Nova Poshta cabinet → API                            | Delivery lookups     |
| `NOVA_POSHTA_API_BASE_URL` | Optional   | Default `https://api.novaposhta.ua/v2.0/json/`       | NP API base          |
| `MEEST_API_BASE_URL`       | Optional   | Default `https://publicapi.meest.com`                | Meest public API     |
| `UKRPOSHTA_API_BASE_URL`   | Optional   | Default `https://ukrposhta.ua/address-classifier-ws` | Ukrposhta classifier |

#### Observability

| Variable                      | Required?             | Where to get it                   | Purpose                         |
| ----------------------------- | --------------------- | --------------------------------- | ------------------------------- |
| `OTEL_ENABLED`                | Optional              | Default off                       | Feature flag                    |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Required if OTEL on   | Local `:4318` or Grafana Cloud    | OTLP export                     |
| `OTEL_SERVICE_NAME`           | Required if OTEL on   | e.g. `my-noodles-api`             | Resource name                   |
| `OTEL_EXPORTER_OTLP_HEADERS`  | Optional              | Grafana auth header (URL-encoded) | OTEL SDK only (not Nest Config) |
| `SENTRY_ENABLED`              | Optional              | Default off                       | Feature flag                    |
| `SENTRY_DSN`                  | Required if Sentry on | Sentry **api** project            | Server errors                   |

#### Object storage (infra-ready — not read by Nest yet)

Present on prod VM via bootstrap / [`devops/compose/.env.example`](../devops/compose/.env.example). Commented in api `.env.example` for awareness only.

| Variable                                                                  | Status                              |
| ------------------------------------------------------------------------- | ----------------------------------- |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Bootstrapped; **no app reader yet** |
| `CDN_PUBLIC_BASE_URL`                                                     | Bootstrapped; **no app reader yet** |

---

## Console-only (no app env)

| Value                      | Where                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| GA4 Measurement ID (`G-…`) | GTM GA4 Configuration tag only — see [analytics-setup.md](./analytics-setup.md) |
| Hotjar Site ID             | GTM Hotjar tag + Hotjar form masking                                            |
| GTM Consent Mode           | Fire GA4/Hotjar only when `analytics_storage` = granted                         |

---

## Production secrets (not in app `.env.example`)

Deploy SSH, Neon API/org, Cloudflare, Hetzner, S3, Origin CA, OpenTofu state passphrase, and build-time `NEXT_PUBLIC_*` / `VITE_*` for CI live in GitHub Environment **`prod`**.

See [devops/docs/secrets.md](../devops/docs/secrets.md). VM template: [devops/compose/.env.example](../devops/compose/.env.example).
