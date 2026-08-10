# TLS — Cloudflare Full (strict) + Origin CA

Part of [edge.md](./edge.md) (`modules/edge`).

| Hop                         | Certificate               |
| --------------------------- | ------------------------- |
| Browser → Cloudflare        | Universal SSL (automatic) |
| Browser → Pages (`admin.`)  | Cloudflare (automatic)    |
| Cloudflare → Hetzner origin | **Origin CA** on Caddy    |

## Setup

1. Cloudflare SSL/TLS mode = **Full (strict)** (never Flexible).
2. Issue a **Cloudflare Origin CA** certificate with SAN:
   - `mynoodles.shop`
   - `www.mynoodles.shop`
   - `api.mynoodles.shop`
3. Prefer OpenTofu `cloudflare_origin_ca_certificate` (see `devops/tofu/modules/edge`) or issue once in the Cloudflare UI.
4. Private key **never in git**. Keep in encrypted tofu state (optionally also GH `ORIGIN_CA_*`).  
   Workflow **bootstrap-host** (after tofu apply, or standalone) writes:
   - `/opt/my-noodles/certs/origin.pem`
   - `/opt/my-noodles/certs/origin.key`
5. Caddy uses file-based TLS only (`tls origin.pem origin.key`) — no Let’s Encrypt ACME on the orange-clouded origin.

## Rotation

Origin CA certs have long TTL; rotate rarely. Edge certs are rotated by Cloudflare.

After replacing files on the VM (cwd `/opt/my-noodles`):

```bash
docker compose -f compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile
# or: docker compose -f compose.prod.yml up -d --force-recreate caddy
```
