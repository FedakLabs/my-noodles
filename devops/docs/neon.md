# Neon Postgres (prod)

Managed Postgres in **EU (Frankfurt)**. IaC: [`modules/neon`](../tofu/modules/neon), wired from [`envs/prod/main.tf`](../tofu/envs/prod/main.tf). No Postgres on the Hetzner VM.

Defaults: region `aws-eu-central-1`, PG 17, scale-to-zero after **300s** idle.

## Apply (CI-only)

Do **not** `tofu apply` prod from a laptop. See [../tofu/README.md](../tofu/README.md).

1. Put `NEON_API_KEY` and `NEON_ORG_ID` in GitHub Environment **`prod`** — [secrets.md](./secrets.md).
2. Actions → **tofu** → `action=plan`, then `action=apply` (working dir `envs/prod`).
3. Copy outputs into GH secrets (and VM `.env` via **bootstrap-host**):
   - `neon_database_url` → `DATABASE_URL` (pooled)
   - `neon_database_url_direct` → `DATABASE_URL_DIRECT` (migrations)

Both outputs already append `channel_binding=require&connect_timeout=10`.

## Scale-to-zero

Override with Environment var `NEON_SUSPEND_TIMEOUT_SECONDS` (`-1` = never suspend). When cold starts hurt checkout under steady traffic, disable scale-to-zero on the prod compute.

## App wiring

| Consumer                  | URL                                                                         |
| ------------------------- | --------------------------------------------------------------------------- |
| API runtime (VM / Nest)   | `DATABASE_URL` (pooled) via `@my-noodles/api-lib`                           |
| Migrations (`deploy-api`) | `DATABASE_URL_DIRECT` only for that process                                 |
| Local dev                 | discrete `POSTGRES_*` against root `docker-compose.yml` — Neon not required |

## Destroy protection

`lifecycle.prevent_destroy = true` on the project in `modules/neon`. To tear down intentionally, remove that block in a PR, then `tofu` with `action=apply`.

## Import existing project

If the DB already exists in the console, add under `envs/prod` and run `tofu`:

```hcl
import {
  to = module.neon.neon_project.main
  id = "your-project-id"
}
```

## PITR runbook

1. Neon Console → project → **Branches** / **Restore** (point-in-time).
2. Restore to a **new branch** first; verify data.
3. Either point `DATABASE_URL` / `DATABASE_URL_DIRECT` at the restored branch, or promote per Neon’s UI.
4. Redeploy api (`deploy-api`) or update VM `.env` + recreate the api container (`pnpm bootstrap:host` if secrets changed).
5. Confirm `GET https://api.mynoodles.shop/api/health/ready`.

Retention follows Neon’s plan limits — check the console before an incident.

## Major version

Align local `docker-compose.yml` Postgres major with the Neon project when upgrading.
