# Analytics setup (GTM + GA4 + Hotjar)

Full external setup checklist (Telegram, Tawk, Nova Poshta, Sentry, prod accounts, all env tables) → [requirements.md](./requirements.md).

GTM-first: the storefront loads a single GTM container (`NEXT_PUBLIC_GTM_ID`). GA4 and Hotjar are tags inside that container — not separate scripts or env vars in Next.

Consent Mode defaults to denied; after the guest accepts, `analytics_storage` is granted. In GTM, fire GA4 and Hotjar only when analytics storage is granted.

## Env vars to fill

Hotjar has **no** env var — Site ID goes only into GTM. Same for the GA4 Measurement ID (`G-…`) — paste it only into the GTM GA4 tag.

### `apps/web` (`.env.local`)

| Variable               | Required?       | Where to get it                                                               | Purpose                                         |
| ---------------------- | --------------- | ----------------------------------------------------------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | Yes (app)       | Your API origin                                                               | Storefront API base URL                         |
| `NEXT_PUBLIC_SITE_URL` | Yes (app)       | Public site origin                                                            | SEO / absolute links                            |
| `NEXT_PUBLIC_GTM_ID`   | Yes (analytics) | [tagmanager.google.com](https://tagmanager.google.com) → container ID `GTM-…` | Loads GTM; without it analytics/Hotjar stay off |

Other MVP keys (Tawk, Telegram, Nova Poshta) and api/admin env tables → [requirements.md](./requirements.md).

### Not env — set in consoles only

| Value                      | Where                                                          |
| -------------------------- | -------------------------------------------------------------- |
| Hotjar Site ID             | Hotjar → Sites → Tracking code → paste into GTM Hotjar tag     |
| GA4 Measurement ID (`G-…`) | Paste into GTM GA4 Configuration tag only                      |
| GTM Consent trigger        | GTM: fire GA4 + Hotjar only when `analytics_storage` = granted |
| Hotjar input masking       | Hotjar Site settings → suppress form fields (checkout PII)     |

## Console steps

1. **GTM** — Create a web container → copy `GTM-…` into `NEXT_PUBLIC_GTM_ID` on web. Publish after tags are ready.
2. **GA4** — Create a property + web data stream → copy `G-…` into the GTM GA4 Configuration tag (not a Next env var).
3. **Hotjar** — Create a site on the free plan → copy Site ID into a GTM Hotjar (or Custom HTML) tag. Enable input masking / form field suppress for checkout fields (phone, email, name, address). Recordings may include checkout; masking covers PII in form inputs.
4. **Consent** — Configure both GA4 and Hotjar tags to require Consent Mode: `analytics_storage` = granted (aligned with the storefront banner).
5. **Other MVP keys** — Fill Tawk, Telegram, and Nova Poshta from [requirements.md](./requirements.md).

## Local verification

Works on `localhost` — use GTM Preview + GA4 DebugView (not only standard reports).

1. Set `NEXT_PUBLIC_GTM_ID=GTM-…` in `apps/web/.env.local` and restart `next dev`.
2. Open the storefront; accept the consent banner (or use the Accept button on the test page).
3. Visit `/uk/dev/analytics` (or `/en/dev/analytics`) — **dev only** (`notFound` in production builds).
4. Click sample event buttons (`view_item`, `add_to_cart`, …). Confirm pushes in the on-page `dataLayer` preview.
5. In [tagmanager.google.com](https://tagmanager.google.com) → **Preview**, connect to your local URL and confirm tags fire after Accept.
6. In GA4 → **Admin** → **DebugView**, confirm the same events arrive.

If `dataLayer` shows events but GA4 does not: check the GA4 Configuration tag, `G-…` ID, Consent Mode trigger (`analytics_storage` = granted), and that the GTM container is **Published**. Disable ad blockers on localhost.

Custom events (`catalog_*`, `click_telegram_order`) need GA4 Event tags in GTM or they stay in `dataLayer` only.

## Free-tier note

GTM and GA4 are free for normal storefront use. Hotjar Basic free (~35 session recordings/day) is enough for early traffic. The first real ceiling is usually the Hotjar plan, not GTM architecture.
