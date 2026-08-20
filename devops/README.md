# DevOps

Production follows [the Cloudflare ADR](../docs/2026-08-17:infrastructure.md).

```text
Namecheap → Cloudflare DNS / Edge
  ├── Next.js + OpenNext Worker       mynoodles.shop
  ├── Admin Worker Static Assets      admin.mynoodles.shop
  ├── API Worker → NestJS Container   api.mynoodles.shop
  └── R2 public media                 cdn.mynoodles.shop
                                      ↓
                                Neon PostgreSQL
```

OpenTofu manages durable resources: Cloudflare zone policy and DNSSEC, R2, Neon, and Grafana dashboards. Wrangler/OpenNext manages application artifacts and Worker Custom Domains. GitHub Actions is the deployment entrypoint. Infisical is the portable secret source and is accessed from deployment jobs through GitHub OIDC; Cloudflare Worker secrets deliver API credentials at runtime.

## Layout

```text
devops/
  cloudflare/       Self-contained Worker, OpenNext, and Container deployment package
    web/            Storefront Worker and OpenNext configuration
    admin/          Static Assets Worker configuration and entrypoint
    api/            Container Worker configuration, entrypoint, and Dockerfile
    scripts/        Deployment build orchestration
  scripts/          Shared dependency-free deployment orchestration
  envs/             Committed non-secret manifest for each environment
  tofu/             Shared infrastructure stack with isolated environment state
```

## Boundaries

- Next.js owns SSR and frontend server behavior.
- The admin Worker serves the Vite build as static assets.
- The API Worker only routes requests to the NestJS Container.
- The NestJS Container owns application logic and Neon access.
- R2 is a public media origin and is not accessed by the NestJS Container.
- Applications do not call Infisical at runtime; deployment jobs synchronize only the secrets each runtime needs.
- Public application configuration, Worker names, and domains come from `envs/<environment>/environment.json`; release identifiers remain deployment metadata.

## Deployment workflows

| Workflow           | Responsibility                                                                |
| ------------------ | ----------------------------------------------------------------------------- |
| `ci.yml`           | Read-only application, OpenTofu, environment, and Wrangler validation         |
| `infra.yml`        | Environment-selected plan and manually approved apply                         |
| `deploy-api.yml`   | Validate the API/Container, run Neon migrations, deploy, and smoke-test       |
| `deploy-admin.yml` | Build and deploy the admin Static Assets Worker, then smoke-test SPA fallback |
| `deploy-web.yml`   | Build and deploy the OpenNext Worker, then smoke-test SSR                     |
| `rollback.yml`     | Rebuild and deploy one application from a previously known-good Git ref       |

Infrastructure and applications are deliberately independent. An infrastructure apply never builds an application, and an application deployment never changes OpenTofu resources. Jobs are serialized per application and environment and use the checked-out commit SHA as release metadata.

## First production setup

1. Create GitHub Environment `prod`, require approval for production jobs, and configure its deployment branch rules for the refs allowed to apply. The OpenTofu plan runs before the protected apply job. Repeat this for every deployable environment before selecting it in a workflow.
2. Add GitHub repository variables `INFISICAL_IDENTITY_ID`, `INFISICAL_PROJECT_SLUG`, and optionally `INFISICAL_DOMAIN`.
3. Authorize that Infisical machine identity to trust this repository through GitHub OIDC.
4. Add the secrets listed below to their Infisical `prod` folders.
5. Run `infra.yml`, review the completed plan, then approve the waiting apply job through the protected `prod` environment.
6. Ensure old DNSSEC/DS records are disabled at Namecheap, then copy the `cloudflare_name_servers` output there. After delegation is active, add the new `cloudflare_dnssec` DS values at Namecheap.
7. Retrieve the sensitive Neon outputs and store the pooled URL as `/api/DATABASE_URL` and the direct URL as `/migrations/DATABASE_URL_DIRECT` in Infisical.
8. Add the remaining `/api` runtime secrets, then deploy API, admin, and web independently.

The Worker deployments create and maintain DNS records and certificates for `mynoodles.shop`, `www`, `admin`, and `api` through Cloudflare Custom Domains. OpenTofu creates the R2 bucket and `cdn` custom domain. Do not add placeholder DNS records for Worker Custom Domains.

### Infisical `/cloudflare`

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID
```

### Infisical `/infra`

```text
GRAFANA_SERVICE_ACCOUNT_TOKEN
GRAFANA_URL
NEON_API_KEY
NEON_ORG_ID
TF_STATE_PASSPHRASE
```

### Infisical `/migrations`

```text
DATABASE_URL_DIRECT
```

### Infisical `/api`

This folder is exported directly to Cloudflare as Worker secrets. It must contain `DATABASE_URL` plus every private runtime value required by the API, including authentication, provider, and Grafana OTLP credentials. Public OTEL settings are committed under `applications.api` in `envs/<environment>/environment.json`.

The media bucket is intentionally dedicated to public objects. Its custom domain exposes objects in that bucket; only public media under the documented `products/` namespace belongs there. The `r2.dev` hostname is disabled, browsers receive no R2 credentials, and the API Container has no R2 binding.
