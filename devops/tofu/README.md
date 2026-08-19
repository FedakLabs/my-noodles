# OpenTofu

OpenTofu manages Cloudflare zone policy, the R2 media bucket and custom domain, Neon PostgreSQL, and durable Grafana Cloud configuration. Worker custom domains, application bundles, Container images, and telemetry ingestion credentials are managed by the deployment workflows.

```text
tofu/
  envs/prod/           production wiring
  modules/cloudflare/  zone lookup, TLS, DNSSEC, edge settings, and media caching
  modules/grafana/     dashboards and observability folders
  modules/neon/        managed PostgreSQL
  modules/r2/          public media bucket
```

Production state is encrypted by OpenTofu and committed by CI. Apply is CI-only and requires GitHub Environment `prod` approval. The state encryption passphrase is retrieved from Infisical through GitHub OIDC and is never committed.

The native Cloudflare provider owns R2 bucket provisioning. Separate S3 credentials are not required because this configuration does not manage R2 objects, S3 bucket policies, or unsupported S3 versioning. `cloudflare_r2_custom_domain` provides public media delivery and automatically manages `cdn.mynoodles.shop` TLS/DNS.

```bash
pnpm tofu:fmt
TF_VAR_state_passphrase=local-validation-only-change-me pnpm tofu:validate
pnpm tofu:plan
pnpm tofu:apply
```

The local validation value never protects production state; it only allows OpenTofu to initialize the encryption configuration during a read-only validation. Production has no default passphrase and receives the real value from Infisical.
