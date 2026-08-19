# Deployment environments

This directory contains committed, non-secret configuration selected by deployment workflows.

```text
envs/
  prod/
    web.json
    admin.json
    api.json
```

Add another sibling directory only when another real deployment environment exists. Keep credentials and other private values in Infisical; these JSON files are public repository configuration.

Release identifiers such as `NEXT_PUBLIC_APP_VERSION`, `VITE_APP_VERSION`, and the API Container's `APP_VERSION` are derived from deployment metadata and do not belong here.
