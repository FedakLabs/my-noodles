# Object Storage

Hetzner Object Storage (S3-compatible). IaC: [`modules/object_storage`](../tofu/modules/object_storage), wired from [`envs/prod/main.tf`](../tofu/envs/prod/main.tf).

One bucket for shareable objects. New file types = new **prefix**, not a new bucket or domain.

| Piece                | Detail                                                      |
| -------------------- | ----------------------------------------------------------- |
| Bucket               | GH var `S3_BUCKET` → `TF_VAR_object_storage_bucket`         |
| Endpoint / region    | `S3_ENDPOINT`, `S3_REGION` — [secrets.md](./secrets.md)     |
| Credentials          | `S3_ACCESS_KEY` / `S3_SECRET_KEY` (tofu + api runtime)      |
| Public read prefixes | `products/*`, `files/*`, `misc/*` (bucket policy in module) |

## Access

- Public **read** only on those prefixes.
- **Write** only with S3 access keys (never in the browser for privileged paths).
- Public URLs go through the edge hostname — see [edge.md](./edge.md) (`cdn.`).

App stores URLs like `https://cdn.mynoodles.shop/products/…` (`CDN_PUBLIC_BASE_URL`).

## Local

Dev may use local files or the same bucket with a `dev/` prefix. Keys stay in `.env.local`.

OpenTofu state is not stored in this bucket — [state-backend.md](./state-backend.md).
