# Edge (Cloudflare)

DNS, admin Pages, Origin CA, and the public `cdn.` hostname. IaC: [`modules/edge`](../tofu/modules/edge), wired from [`envs/prod/main.tf`](../tofu/envs/prod/main.tf).

| Hostname                 | Target                                                |
| ------------------------ | ----------------------------------------------------- |
| `mynoodles.shop` / `www` | Proxied A → **Hetzner LB** (`module.app.origin_ipv4`) |
| `api.mynoodles.shop`     | Proxied A → **Hetzner LB**                            |
| `admin.mynoodles.shop`   | Proxied CNAME → Cloudflare Pages project              |
| `cdn.mynoodles.shop`     | Proxied CNAME → Object Storage endpoint               |

```text
Users → Cloudflare (proxy) → Hetzner LB11 (TCP 80/443)
                              ├─ app-1 Caddy → web / api
                              └─ app-2 Caddy → web / api
```

App VM firewall allows **80/443 only from the LB** address. Set GH var `SSH_ALLOWED_CIDRS` to lock TCP/22 once deploy egress is known ([secrets.md](./secrets.md)).

## Related runbooks

| Doc                                    | Topic                              |
| -------------------------------------- | ---------------------------------- |
| [dns-namecheap.md](./dns-namecheap.md) | One-time NS cutover to Cloudflare  |
| [origin-ca.md](./origin-ca.md)         | Full (strict) + Origin CA on Caddy |

## CDN

`cdn.` is orange-clouded; Cloudflare caches in front of the Object Storage endpoint (`cdn_cname_target` from `S3_ENDPOINT`).

Add cache rules for hashed/immutable paths when you introduce fingerprinting.

## Admin Pages

OpenTofu creates the Pages project + custom domain. Deploys: Actions → **deploy-admin** (static `dist/`, no Docker).
