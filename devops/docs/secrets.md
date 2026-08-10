# Secrets

**No Azure Key Vault / HashiCorp Vault on MVP.** Sources of truth:

| Kind                              | Where                                                          |
| --------------------------------- | -------------------------------------------------------------- |
| App runtime + deploy              | GitHub Environment **`prod`**                                  |
| Infra tokens / Origin CA material | Encrypted OpenTofu **state** (git) + GH secrets for **`tofu`** |
| Local app dev                     | `.env` / `.env.local` (gitignored)                             |

Create Environment **`prod`** only (no staging).

**Prod OpenTofu is CI-only** — do not `tofu apply` from a laptop. See [state-backend.md](./state-backend.md) and [../tofu/README.md](../tofu/README.md).

Naming rule: GH secrets/vars use **domain names** (`NEON_ORG_ID`, `S3_ACCESS_KEY`, …). Workflows map to `TF_VAR_*` / app env only at the job boundary — never store `TF_VAR_*` as the secret name.

## GitHub Environment `prod`

### Shared / deploy

| Name                    | Kind   | Type                  | Example                                               | Used by                                             |
| ----------------------- | ------ | --------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `DEPLOY_SSH_HOST`       | secret | CSV of IPs (optional) | `203.0.113.10,203.0.113.11`                           | fallback if tofu `app_ipv4` unavailable             |
| `DEPLOY_SSH_USER`       | secret | string                | `deploy`                                              | deploy-web, deploy-api, bootstrap-host              |
| `DEPLOY_SSH_KEY`        | secret | PEM private key       | `-----BEGIN OPENSSH PRIVATE KEY-----…`                | deploy-web, deploy-api, bootstrap-host              |
| `DEPLOY_SSH_PUBLIC_KEY` | secret | SSH public key        | `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5… deploy@my-noodles` | tofu → Hetzner                                      |
| `ORIGIN_CA_CERTIFICATE` | secret | PEM                   | `-----BEGIN CERTIFICATE-----…`                        | bootstrap-host fallback (prefer tofu state outputs) |
| `ORIGIN_CA_PRIVATE_KEY` | secret | PEM                   | `-----BEGIN PRIVATE KEY-----…`                        | bootstrap-host fallback (prefer tofu state outputs) |

Deploy/bootstrap resolve SSH hosts from tofu output **`app_ipv4`** (both app VMs). Set `DEPLOY_SSH_HOST` only as an emergency CSV override.

### Neon

| Name                  | Kind   | Type         | Example                                                                                                                           | Used by               |
| --------------------- | ------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `NEON_API_KEY`        | secret | string       | `napi_xxxxxxxx…` (Console → API Keys)                                                                                             | tofu                  |
| `NEON_ORG_ID`         | secret | string       | `org-restless-silence-28866559`                                                                                                   | tofu                  |
| `DATABASE_URL`        | secret | Postgres URL | `postgresql://u:p@ep-xxx-pooler.eu-central-1.aws.neon.tech/my_noodles?sslmode=require&channel_binding=require&connect_timeout=10` | api runtime (pooled)  |
| `DATABASE_URL_DIRECT` | secret | Postgres URL | same host **without** `-pooler` in hostname                                                                                       | deploy-api migrations |

### Cloudflare

| Name                       | Kind   | Type         | Example                                          | Used by             |
| -------------------------- | ------ | ------------ | ------------------------------------------------ | ------------------- |
| `CLOUDFLARE_API_TOKEN`     | secret | string       | `abc123…` (API Tokens)                           | tofu + deploy-admin |
| `CLOUDFLARE_ACCOUNT_ID`    | secret | string (hex) | `a1b2c3d4e5f6…` (32 chars)                       | tofu + deploy-admin |
| `CLOUDFLARE_ZONE_ID`       | secret | string (hex) | `f6e5d4c3…` (Overview → Zone ID)                 | tofu                |
| `CLOUDFLARE_PAGES_PROJECT` | var    | string       | `my-noodles-admin`                               | tofu + deploy-admin |
| `VITE_API_URL`             | var    | URL          | `https://api.mynoodles.shop`                     | deploy-admin        |
| `VITE_AUTH_API_URL`        | var    | URL          | `https://api.mynoodles.shop`                     | deploy-admin        |
| `VITE_SENTRY_DSN`          | var    | URL          | `https://…@….ingest.sentry.io/…` (admin project) | deploy-admin        |

### Object Storage / CDN (S3-compatible) — shared by tofu + api runtime

| Name                  | Kind   | Type   | Example                               | Used by    |
| --------------------- | ------ | ------ | ------------------------------------- | ---------- |
| `S3_ACCESS_KEY`       | secret | string | Hetzner Object Storage access key     | tofu + api |
| `S3_SECRET_KEY`       | secret | string | Hetzner Object Storage secret key     | tofu + api |
| `S3_ENDPOINT`         | var    | URL    | `https://fsn1.your-objectstorage.com` | tofu + api |
| `S3_REGION`           | var    | string | `fsn1`                                | tofu + api |
| `S3_BUCKET`           | var    | string | `my-noodles-media`                    | tofu + api |
| `CDN_PUBLIC_BASE_URL` | var    | URL    | `https://cdn.mynoodles.shop`          | api        |

### Hetzner / OpenTofu state

| Name                  | Kind   | Type               | Example                               | Used by                                             |
| --------------------- | ------ | ------------------ | ------------------------------------- | --------------------------------------------------- |
| `HCLOUD_TOKEN`        | secret | string             | Hetzner Cloud → Security → API tokens | tofu                                                |
| `TF_STATE_PASSPHRASE` | secret | string (≥16 chars) | `openssl rand -base64 32`             | tofu, bootstrap-host, deploy-web/api (host resolve) |

### Storefront (deploy-web build-args)

| Name                     | Kind | Type   | Example                                                  | Used by    |
| ------------------------ | ---- | ------ | -------------------------------------------------------- | ---------- |
| `NEXT_PUBLIC_API_URL`    | var  | URL    | `https://api.mynoodles.shop`                             | deploy-web |
| `NEXT_PUBLIC_SITE_URL`   | var  | URL    | `https://mynoodles.shop`                                 | deploy-web |
| `NEXT_PUBLIC_GTM_ID`     | var  | string | `GTM-XXXXXXX` (optional)                                 | deploy-web |
| `NEXT_PUBLIC_SENTRY_DSN` | var  | URL    | `https://…@….ingest.sentry.io/…` (web project, optional) | deploy-web |

### API runtime (other)

| Name                          | Kind   | Type               | Example                                                | Notes                                                                |
| ----------------------------- | ------ | ------------------ | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `JWT_SECRET`                  | secret | string (≥32 chars) | long random (`openssl rand -base64 48`)                | admin auth                                                           |
| `ADMIN_EMAIL`                 | secret | email              | `ops@mynoodles.shop`                                   | bootstrap admin                                                      |
| `ADMIN_PASSWORD`              | secret | string             | strong password                                        | bootstrap admin                                                      |
| `TELEGRAM_BOT_TOKEN`          | secret | string             | `123456:ABC-DEF…`                                      | BotFather                                                            |
| `TELEGRAM_CHAT_ID`            | secret | string / int       | `-1001234567890`                                       | support chat                                                         |
| `TAWK_API_KEY`                | secret | string             | Tawk HMAC / API key                                    |                                                                      |
| `TAWK_PROPERTY_ID`            | secret | string             | Tawk property id                                       |                                                                      |
| `TAWK_WIDGET_ID`              | secret | string             | Tawk widget id                                         |                                                                      |
| `NOVA_POSHTA_API_KEY`         | secret | string             | Nova Poshta API key                                    |                                                                      |
| `OTEL_ENABLED`                | var    | boolean string     | `false` (default) / `true` with endpoint               | Bootstrap forces `false` when `OTEL_EXPORTER_OTLP_ENDPOINT` is empty |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | secret | URL                | `https://otlp-gateway-prod-eu-west-0.grafana.net/otlp` | Grafana Cloud                                                        |
| `OTEL_EXPORTER_OTLP_HEADERS`  | secret | header line        | `Authorization=Basic%20…`                              | URL-encoded                                                          |
| `OTEL_SERVICE_NAME`           | var    | string             | `my-noodles-api`                                       |                                                                      |
| `SENTRY_ENABLED`              | var    | boolean string     | `false` (default) / `true` with DSN                    | Bootstrap forces `false` when `SENTRY_DSN` is empty                  |
| `SENTRY_DSN`                  | secret | URL                | `https://…@….ingest.sentry.io/…` (api project)         | API error reporting                                                  |

### Optional infra **vars** (empty = tofu defaults)

| Name                           | Kind | Type                | Example               | tofu variable                  | Default if unset                                           |
| ------------------------------ | ---- | ------------------- | --------------------- | ------------------------------ | ---------------------------------------------------------- |
| `DOMAIN`                       | var  | string              | `mynoodles.shop`      | `domain`                       | `mynoodles.shop`                                           |
| `PROJECT_NAME`                 | var  | string              | `my-noodles`          | `project_name`                 | `my-noodles`                                               |
| `APP_SERVERS`                  | var  | number (as string)  | `2`                   | `app_servers`                  | `2` (min 2)                                                |
| `SERVER_TYPE`                  | var  | string              | `cx33`                | `server_type`                  | `cx33`                                                     |
| `HETZNER_LOCATION`             | var  | string              | `fsn1`                | `location`                     | `fsn1`                                                     |
| `NEON_SUSPEND_TIMEOUT_SECONDS` | var  | number (as string)  | `300` or `-1`         | `neon_suspend_timeout_seconds` | `300`                                                      |
| `SSH_ALLOWED_CIDRS`            | var  | JSON array of CIDRs | `["203.0.113.10/32"]` | `ssh_allowed_cidrs`            | open (`0.0.0.0/0`) — set this once deploy egress is stable |

Prod always has a **Hetzner LB**; Cloudflare A records point at the LB. App VM firewall allows **80/443 only from the LB** (SSH via `SSH_ALLOWED_CIDRS`).

No committed `terraform.tfvars` for prod.

GHCR push uses `GITHUB_TOKEN` with `packages: write` on deploy workflows.

## After `tofu`

1. `action=apply` runs OpenTofu, then calls reusable workflow **bootstrap-host** (compose, Caddyfile, Origin CA, `.env` on **all** app VMs). Needs `DEPLOY_SSH_USER` / `DEPLOY_SSH_KEY` + `JWT_SECRET` + `ADMIN_*` (+ `TF_STATE_PASSPHRASE` for host resolve).
2. Copy Neon URLs into GH secrets if needed for migrations: `DATABASE_URL` / `DATABASE_URL_DIRECT`.
3. Re-sync hosts anytime: `pnpm bootstrap:host` or Actions → **bootstrap-host**.

Do **not** put secrets in cloud-init user-data — only Docker + `mkdir` there.

## OpenTofu state

Encrypted local state committed by CI. Bootstrap: [state-backend.md](./state-backend.md).
