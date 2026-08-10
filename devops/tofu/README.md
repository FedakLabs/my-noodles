# OpenTofu

Manages Hetzner **LB + app VMs**, Cloudflare DNS/Pages/Origin CA, Object Storage, and Neon Postgres.

## Layout

```text
devops/tofu/
  modules/
    app/             # Hetzner — LB11 + 2+ app VMs (Compose hosts)
    edge/            # Cloudflare — DNS → LB, admin Pages, Origin CA
    neon/            # Neon Postgres
    object_storage/  # Hetzner Object Storage (CDN files)
  envs/
    prod/            # live stack — CI working directory
    # stg/           # later: copy of prod, separate state
  README.md
```

| Path                     | Role                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- |
| `modules/app`            | LB + VMs where web + api containers run                                         |
| `modules/edge`           | Public DNS (A → LB), admin SPA, TLS — [../docs/edge.md](../docs/edge.md)        |
| `modules/neon`           | Managed Postgres — [../docs/neon.md](../docs/neon.md)                           |
| `modules/object_storage` | Shareable files bucket — [../docs/object-storage.md](../docs/object-storage.md) |
| `envs/prod`              | Production wiring + encrypted state `terraform.tfstate`                         |

Open `envs/prod/main.tf` for module wiring.

Defaults: `app_servers = 2`, always-on LB11, Cloudflare origins = LB IPv4.

## Policy: CI-only apply

| Allowed locally                                 | Forbidden locally                                    |
| ----------------------------------------------- | ---------------------------------------------------- |
| Read HCL, `pnpm tofu:fmt`, `pnpm tofu:validate` | `tofu init` / decrypt against **prod** state         |
|                                                 | `tofu plan` / `tofu apply` / `tofu destroy` for prod |

Prod plan/apply: [`.github/workflows/tofu.yml`](../../.github/workflows/tofu.yml) (Environment `prod`, cwd `devops/tofu/envs/prod`).

- `action=plan` → `tofu plan -out=tfplan`
- `action=apply` → apply that plan, commit encrypted state, then calls [bootstrap-host](../../.github/workflows/bootstrap-host.yml)

### pnpm (repo root)

```bash
pnpm tofu:plan                 # CI plan (ref=main; override: gh … -f ref=…)
pnpm tofu:apply                # CI apply (+ state commit + bootstrap-host)
pnpm bootstrap:host            # sync all app VMs only
pnpm tofu:fmt                  # local fmt
pnpm tofu:validate             # local init -backend=false + validate
```

## Bootstrap (once)

1. Set `TF_STATE_PASSPHRASE` — [../docs/state-backend.md](../docs/state-backend.md).
2. GH Environment `prod` secrets/vars — [../docs/secrets.md](../docs/secrets.md).
3. `pnpm tofu:plan` → review → `pnpm tofu:apply` (use a **branch** ref, usually `main`).

## After apply

- CI commits encrypted `envs/prod/terraform.tfstate`.
- **bootstrap-host** writes compose / Origin CA / `.env` on every app VM (hosts from `app_ipv4`).
- Copy Neon URLs into GH secrets for migrations — [../docs/neon.md](../docs/neon.md).
- Origin CA details — [../docs/origin-ca.md](../docs/origin-ca.md).

## Staging later

1. Copy `envs/prod` → `envs/stg`.
2. Change names/sizes (separate bucket / Pages project).
3. Separate encrypted state file under `envs/stg/`; GH Environment **`stg`**.
4. Point a workflow at `envs/stg`; job names end with `· stg`.

Still CI-only. Use **folders per env**, not Terraform workspaces.
