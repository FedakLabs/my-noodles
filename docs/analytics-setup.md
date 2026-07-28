# Analytics setup (GTM + GA4 + Hotjar)

GTM-first: the storefront loads a single GTM container (`NEXT_PUBLIC_GTM_ID`). GA4 and Hotjar are tags inside that container — not separate scripts or env vars in Next.

Consent Mode defaults to denied; after the guest accepts, `analytics_storage` is granted. In GTM, fire GA4 and Hotjar only when analytics storage is granted.

## Env vars to fill

Hotjar has **no** env var — Site ID goes only into GTM.

### `apps/web` (`.env` / `.env.local`)

| Variable                       | Required?          | Where to get it                                                               | Purpose                                                |
| ------------------------------ | ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_GTM_ID`           | Yes (analytics)    | [tagmanager.google.com](https://tagmanager.google.com) → container ID `GTM-…` | Loads GTM; without it analytics/Hotjar stay off        |
| `NEXT_PUBLIC_GA4_ID`           | Recommended        | GA4 Admin → Data streams → Measurement ID `G-…`                               | Mirror ID in env (GA4 tag itself is configured in GTM) |
| `NEXT_PUBLIC_TAWK_PROPERTY_ID` | Yes (support chat) | Tawk → Administration → Channels → Chat Widget                                | Widget embed                                           |
| `NEXT_PUBLIC_TAWK_WIDGET_ID`   | Yes (support chat) | Same Tawk widget URL path                                                     | Widget embed                                           |
| `NEXT_PUBLIC_API_URL`          | Yes (app)          | Your API origin                                                               | Already needed for storefront                          |
| `NEXT_PUBLIC_SITE_URL`         | Yes (app)          | Public site origin                                                            | Already needed for SEO/links                           |

### `apps/api` (`.env` / `.env.local`)

| Variable              | Required?                  | Where to get it                            | Purpose                   |
| --------------------- | -------------------------- | ------------------------------------------ | ------------------------- |
| `TAWK_API_KEY`        | Yes (secure visitor login) | Tawk → Administration → Overview → API Key | HMAC for Tawk secure mode |
| `TELEGRAM_BOT_TOKEN`  | Yes (order alerts)         | [@BotFather](https://t.me/BotFather)       | Telegram notifications    |
| `TELEGRAM_CHAT_ID`    | Yes (order alerts)         | Bot chat / getUpdates                      | Destination chat          |
| `NOVA_POSHTA_API_KEY` | Yes (delivery)             | Nova Poshta cabinet → API                  | Delivery lookups          |

### Not env — set in consoles only

| Value                      | Where                                                                       |
| -------------------------- | --------------------------------------------------------------------------- |
| Hotjar Site ID             | Hotjar → Sites → Tracking code → paste into GTM Hotjar tag                  |
| GA4 Measurement ID (`G-…`) | Also paste into GTM GA4 Configuration tag (same ID as `NEXT_PUBLIC_GA4_ID`) |
| GTM Consent trigger        | GTM: fire GA4 + Hotjar only when `analytics_storage` = granted              |
| Hotjar input masking       | Hotjar Site settings → suppress form fields (checkout PII)                  |

## Console steps

1. **GTM** — Create a web container → copy `GTM-…` into `NEXT_PUBLIC_GTM_ID` on web. Publish after tags are ready.
2. **GA4** — Create a property + web data stream → copy `G-…` into the GTM GA4 Configuration tag. Optionally also set `NEXT_PUBLIC_GA4_ID` in web env.
3. **Hotjar** — Create a site on the free plan → copy Site ID into a GTM Hotjar (or Custom HTML) tag. Enable input masking / form field suppress for checkout fields (phone, email, name, address). Recordings may include checkout; masking covers PII in form inputs.
4. **Consent** — Configure both GA4 and Hotjar tags to require Consent Mode: `analytics_storage` = granted (aligned with the storefront banner).
5. **Other MVP keys** — Fill Tawk, Telegram, and Nova Poshta from the tables above.

## Free-tier note

GTM and GA4 are free for normal storefront use. Hotjar Basic free (~35 session recordings/day) is enough for early traffic. The first real ceiling is usually the Hotjar plan, not GTM architecture.
