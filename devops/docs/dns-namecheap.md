# DNS — Namecheap → Cloudflare

One-time NS cutover for [edge.md](./edge.md).

One-time:

1. Add site `mynoodles.shop` in Cloudflare (Free is enough).
2. Copy Cloudflare nameservers.
3. Namecheap → Domain List → Manage → Nameservers → **Custom DNS** → paste CF NS.
4. Wait for propagation; zone becomes **Active** in Cloudflare.
5. Apply OpenTofu Cloudflare resources (A/AAAA/CNAME for web/api/cdn, Pages custom domain for admin).

Do not keep duplicate authoritative records at Namecheap once NS are at Cloudflare.
