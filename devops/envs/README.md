# Deployment environments

This directory contains committed, non-secret configuration selected by deployment workflows.

```text
envs/
  prod/
    environment.yaml
```

Each manifest owns the environment's deployment safeguards, Cloudflare Worker names and custom
domains, and public application build/runtime values. YAML comments document optional values
without exporting them as empty strings. Uncomment an optional value only when the integration is
configured. CI strictly validates the manifest, verifies that Worker names and domains are unique
across every committed environment, and ensures that each public URL matches its deployment target.

To add an environment, add one sibling directory with the shared deployment files, add
`devops/tofu/envs/<environment>/terraform.tfvars` when it has infrastructure, create the matching
GitHub Environment, and create the matching Infisical environment. Workflows and deployment scripts
derive everything else from the selected environment name.

Keep credentials and other private values in Infisical; `environment.yaml` is public repository
configuration. Quote values that YAML would otherwise interpret as another type, such as `"true"`;
all application environment variable values must be strings.

Release identifiers such as `NEXT_PUBLIC_APP_VERSION`, `VITE_APP_VERSION`, and the API Container's `APP_VERSION` are derived from deployment metadata and do not belong here.
