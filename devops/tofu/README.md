# OpenTofu

OpenTofu manages Cloudflare zone policy, the R2 media bucket and custom domain, Neon PostgreSQL, and durable Grafana Cloud configuration. Worker custom domains, application bundles, Container images, and telemetry ingestion credentials are managed by the deployment workflows.

```text
tofu/
  stack/               shared root module, provider lock, encryption, and backend declaration
  envs/<environment>/  environment variables and encrypted state only
  modules/cloudflare/  zone lookup, TLS, DNSSEC, edge settings, and media caching
  modules/grafana/     dashboards and observability folders
  modules/neon/        managed PostgreSQL
  modules/r2/          public media bucket
```

Each environment has isolated encrypted state committed by CI. Apply is CI-only and waits on the
selected GitHub Environment. The state encryption passphrase comes from the matching Infisical
environment through GitHub OIDC and is never committed.

Zone settings, DNSSEC, and the zone-level media cache rules are shared resources. Exactly one
environment for a Cloudflare zone must set `manage_cloudflare_zone = true`; sibling environments
using that zone must set it to `false`. Their Neon, R2, and Grafana resources remain isolated by
environment-specific values and names.

The native Cloudflare provider owns R2 bucket provisioning. Separate S3 credentials are not required because this configuration does not manage R2 objects, S3 bucket policies, or unsupported S3 versioning. `cloudflare_r2_custom_domain` provides public media delivery and automatically manages `cdn.mynoodles.shop` TLS/DNS.

```bash
pnpm tofu:fmt
TF_VAR_state_passphrase=local-validation-only-change-me pnpm tofu:validate
pnpm tofu:plan [environment] [ref]
```

`pnpm tofu:plan` defaults to `prod main`. The workflow always creates a saved environment-specific
plan first, then the selected protected GitHub Environment holds the apply job for manual approval.
The apply job uses that exact plan artifact and commits state back to the selected environment path.
Allowed apply refs are controlled by that GitHub Environment's deployment branch rules.

The local validation value never protects deployed state; it only allows OpenTofu to initialize the
encryption configuration during read-only validation. Deployed environments have no default
passphrase.
