# OpenTofu state (bootstrap)

Prod state is an **OpenTofu-encrypted** local file committed to this repo by CI. It is **not** plaintext and is **not** managed by a separate S3/R2 bucket (chicken-and-egg avoided for MVP).

Path: [`devops/tofu/envs/prod/terraform.tfstate`](../tofu/envs/prod/terraform.tfstate)

Encryption: [OpenTofu state encryption](https://opentofu.org/docs/language/state/encryption/) (`pbkdf2` + `aes_gcm`) in [`envs/prod/encryption.tf`](../tofu/envs/prod/encryption.tf). CI maps `TF_STATE_PASSPHRASE` → `TF_VAR_state_passphrase`.

## One-time bootstrap

1. Generate a long passphrase (≥16 characters), e.g. `openssl rand -base64 32`.
2. Put it in GitHub Environment **`prod`** as secret `TF_STATE_PASSPHRASE`.
3. Also set provider secrets listed in [secrets.md](./secrets.md) (`HCLOUD_TOKEN`, `NEON_*`, `S3_*`, Cloudflare, …).
4. Run Actions → **tofu** with a **branch** ref (usually `main`), `action=plan`, then `action=apply`.

After apply, CI commits the encrypted state file back to that branch.

After bootstrap, **never** `tofu apply` prod from a laptop. Lose the passphrase and the state is unrecoverable — keep a secure backup of `TF_STATE_PASSPHRASE`.

## Policy

| Allowed                                                     | Forbidden                                          |
| ----------------------------------------------------------- | -------------------------------------------------- |
| CI `tofu` workflow (plan / apply)                           | Laptop `tofu init` / `plan` / `apply` against prod |
| Reading HCL locally; `pnpm tofu:fmt` / `pnpm tofu:validate` | Committing an unencrypted state file               |

Apply concurrency is serialized by the workflow (`concurrency: tofu-prod`). Prefer `ref=main` for apply so state and code stay aligned.

## Future migration → S3 / R2

Encryption stays. When you want a real remote backend:

1. Create a private state bucket and restore `TF_STATE_*` bucket secrets (see git history of this doc / old `backend.hcl.example`).
2. Change [`envs/prod/backend.tf`](../tofu/envs/prod/backend.tf) to `backend "s3" {}` and restore CI `backend.hcl` generation.
3. From CI: `tofu init -migrate-state`.
4. Remove the “Commit encrypted state” step; stop tracking `terraform.tfstate` (re-ignore in `.gitignore`).

CI runs OpenTofu from `devops/tofu/envs/prod`.
