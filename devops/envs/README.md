# Deployment environments

This directory contains committed, non-secret configuration selected by deployment workflows.

```text
envs/
  prod/
    environment.json
```

Each manifest owns the Cloudflare Worker names, custom domains, and public application build/runtime
values for that environment. Optional integrations are omitted until they are configured.

To add an environment, add one sibling directory with the shared deployment files, add
`devops/tofu/envs/<environment>/terraform.tfvars` when it has infrastructure, create the matching
GitHub Environment, and create the matching Infisical environment. The folder owner is responsible
for those values; workflows consume the selected folder as provided instead of maintaining a
separate environment schema or naming policy.

Keep credentials and other private values in Infisical; `environment.json` is public repository
configuration.

Release identifiers such as `NEXT_PUBLIC_APP_VERSION`, `VITE_APP_VERSION`, and the API Container's `APP_VERSION` are derived from deployment metadata and do not belong here.
