# Rollback

## App (web / api)

1. Find the last good commit SHA (GitHub Actions run or `git log`).
2. Actions → `deploy-web` or `deploy-api` → **Run workflow** with `ref=<sha>` (no `sha-` prefix).
3. Workflow builds that commit, tags GHCR `sha-<short>`, and `docker compose up --wait` on the VM.
4. Verify:
   - web: `https://mynoodles.shop/`
   - api: `https://api.mynoodles.shop/api/health/ready`

## Admin

Re-run `deploy-admin` with `ref=<sha>`. Pages deploy replaces the static bundle for `admin.mynoodles.shop`.

## Migrations

Prefer **forward-friendly** migrations. If a bad migration shipped:

1. Fix forward with a new migration and `deploy-api`, or
2. Manual revert on the VM / CI job using **direct** Neon URL:

```bash
export DATABASE_URL="$DATABASE_URL_DIRECT"
pnpm nx run api:migration:revert
```

Then roll the api container to a compatible `sha-*`.

## Neon data

See [neon.md](./neon.md) PITR — restore to a branch, verify, cut over connection strings.
