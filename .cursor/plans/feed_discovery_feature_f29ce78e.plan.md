---
name: Feed Discovery Feature
overview: A YouTube Shorts-style /feed page driven by a single POST /feed/next endpoint that records the previous product's dwell and returns the next personalized item. Tags are client-side (Zustand-persisted) and sent in the body to narrow results; likes are recorded server-side in a cookie session. Synthetic localized comments load from a dedicated table. Build backend-first, then the full-screen mobile-first UI (MediaGallery, hashtags, comments side-panel/drawer, share, like-to-narrow).
todos:
  - id: be-entities-migration
    content: Create apps/api/src/application/feed/ entities (FeedSession, FeedSessionLike, FeedSessionView, FeedProductComment) and a CreateFeed migration mirroring CreateCatalog (uuidv7 PKs, FKs, partial indexes, JSONB localized comment, view dwell_ms + filters-context JSONB column).
    status: completed
  - id: be-cookie-cors
    content: Add cookie-parser middleware + CORS credentials/origin in index.ts; configure api-clients fetch SDK with credentials:'include'; add resolveOrCreateSession helper (lazy create + Set-Cookie + expiry refresh).
    status: completed
  - id: be-endpoints-dtos
    content: 'Build FeedController + class-validator DTOs: POST /feed/next (body: previousProduct {id,viewTime} + filters {category?,country?,brand?} reusing a shared base extracted from ProductFilterQueryDto), POST/DELETE /feed/products/:productId/like, GET /feed/products/:productId/comments, GET /feed/likes. Product-scoped routes namespaced under /feed/products/:productId/*; feed-scoped flat under /feed/*. Tune throttler for /feed/next. Register FeedModule in app.module.'
    status: completed
  - id: be-services-personalization
    content: Implement FeedSessionService (lazy session + record view/like + keep-alive) and FeedService next-item personalization QueryBuilder (exclude session-viewed, hard-filter by body filters via shared buildProductWhere, boost liked categories/brands/countries + dwell + sortWeight + random) + FeedCommentsService (locale-resolved). Item carries liked flag.
    status: completed
  - id: be-seed-tests
    content: Seed synthetic localized feed_product_comments; add co-located Jest tests for lazy session, next records previousProduct + excludes viewed + respects body filters, like toggle, comments localization. Run api:validate + migration:run.
    status: completed
  - id: be-regen-client
    content: Regenerate OpenAPI + storefront client (api:generate:openapi -> web generate:clients -> api-clients:build) so feed endpoints are typed for the web app.
    status: completed
  - id: fe-tags-store-api
    content: Add persisted Zustand feed-hashtag store (apps/web/src/hooks/feed/) holding the canonical grouped filters {} (== wire shape) with a derived flat-chips view for rendering, and apps/web/src/api/feed/ (fetchers, query keys, useFeedNext mutation, like mutations, likes + comments queries). next mutation sends the store's filters as-is + previousProduct.
    status: completed
  - id: fe-route-screen
    content: Add app/[locale]/feed/page.tsx (noindex) + screens/feed/index.tsx (client). On mount call /feed/next (tags only); on advance call /feed/next with previousProduct {id,viewTime}; buffer returned items locally for the vertical pager.
    status: completed
  - id: fe-feedcard-actions
    content: Build dark full-screen FeedCard with MediaGallery, name/price overlay, hashtag chips (add tag to store + refetch), and the right-side action rail (like, comments, share, active-tags dropdown with remove).
    status: completed
  - id: fe-panels-drawers
    content: Build the details bottom Drawer (partial height), the comments panel (desktop sidebar matching card width / mobile drawer) with auto-avatars + disabled input + honest note, and the liked-products list with unlike.
    status: completed
  - id: fe-empty-exit-i18n
    content: Add exhausted empty state (show/clear active tags), top-left white exit X -> /catalog redirect, feed i18n messages (uk/en) registered in messages.ts, and Vitest component tests. Run web:validate.
    status: completed
isProject: false
---

# Feed Discovery Feature

A full-screen, dark, swipe-one-at-a-time product discovery feed at `/feed`, inspired by YouTube Shorts.

**One core endpoint, `POST /feed/next`, does everything per scroll:** it records the _previous_ product's dwell (`previousProduct: {id, viewTime}`) and returns the _next_ personalized product. **Filters (hashtags) are client-side** (Zustand-persisted) and passed in the request body as a grouped `filters: { category?: string[], country?: string[], brand?: string[] }` object — the **same shape as the catalog products request** — so the backend reuses `buildProductWhere()`. Add/remove is instant, no DB round-trip. The store persists this grouped `filters` object **canonically** (identical to the wire shape, sent as-is); the UI renders a **derived flat "hashtag" chips view** (each chip = one dimension value) with a delete that maps back to removing that value from its dimension array. **Likes are recorded server-side** in an anonymous cookie session (used for "see similar" boosting + future insights). Comments are synthetic-but-honest "taste impressions" loaded from a dedicated table.

Per the user's choice, build **backend-first**, then the UI.

## Architecture & data flow

```mermaid
sequenceDiagram
  participant UI as Feed UI (/feed)
  participant API as NestJS feed module
  participant DB as Postgres

  Note over UI: hashtags live in Zustand (persisted) -> serialized to filters {}
  UI->>API: POST /api/feed/next { filters } (no cookie yet)
  API->>DB: lazily create session, refresh expiry
  API->>DB: score candidates (buildProductWhere(filters), exclude viewed, boost likes)
  API-->>UI: Set-Cookie feed_sid; one item { id, media, hashtags, price, liked }
  Note over UI: user dwells, then swipes
  UI->>API: POST /api/feed/next { previousProduct {id, viewTime}, filters }
  API->>DB: record view (dwell + filters context) for previousProduct; refresh expiry
  API->>DB: re-score, exclude viewed, apply filters
  API-->>UI: next item (or { item: null, exhausted: true })
  UI->>API: POST /api/feed/products/:productId/like (toggle via DELETE)
  UI->>API: GET /api/feed/products/:productId/comments (on comments open)
```

Personalization (simple, tunable SQL now; AI-ready later): candidates = products not in this session's `views`, **hard-filtered by the body `filters`** via the shared `buildProductWhere()` (OR within a dimension, AND across dimensions — same semantics as the catalog). Score = weighted boosts for categories/brands/countries of liked products (session) + dwell signal + `sortWeight` + small random for variety; `ORDER BY score DESC, random() LIMIT 1`. Liking boosts toward "similar"; unliking widens. Exhausted set -> `{ item: null, exhausted: true }` -> UI suggests clearing hashtags.

Notes: filters are deliberately **not** persisted in the DB (the body carries them every call, so a DB table adds no value for narrowing). The active filter set is still captured for analytics via a `filters` JSONB context column on each `feed_session_views` row. The final product's dwell before leaving the page isn't recorded (no following `next` call) — an acceptable MVP gap (could add a `sendBeacon` later).

## Backend (`apps/api/src/application/feed/`)

Mirror the products module patterns: entities use `@UuidV7PrimaryColumn`, `TimestampEntity`, snake_case `@Column({ name })`, `@LocalizedColumn` for JSONB i18n; service uses TypeORM repository/QueryBuilder; locale resolves via existing `LocaleContext` (`x-app-locale` header) — no `locale=` param.

### New tables (one migration `CreateFeed`, mirroring [CreateCatalog](apps/api/src/infrastructure/migrations/1740422400000-CreateCatalog.ts)) — 4 tables, no tags table

- `feed_sessions` — `id` (uuidv7, also the cookie value), `expires_at timestamptz`, timestamps.
- `feed_session_likes` — `id`, `session_id` FK->feed_sessions (CASCADE), `product_id` FK->products, `created_at`, `deleted_at` (unlike = soft delete). Partial unique `(session_id, product_id) WHERE deleted_at IS NULL`.
- `feed_session_views` — `id`, `session_id` FK, `product_id` FK, `dwell_ms int`, `filters jsonb` (active filter context at view time, analytics), `created_at` (the per-view engagement record; doubles as the exclusion/dedup source). Index on `(session_id, product_id)`. Extensible: future per-view signals (`opened_details`, `opened_comments`, `shared`, ...) become columns here, no new table.
- `feed_product_comments` — `id`, `product_id` FK, `author_name text`, `comment jsonb` (localized `{uk,en}` via `@LocalizedColumn`), `created_at`. Index on `product_id`.

Entities live as `*.entity.ts` files (auto-globbed by [data-source.ts](apps/api/src/infrastructure/persistence/data-source.ts)).

### Cookie/session plumbing

- Add `cookie-parser` middleware in [index.ts](apps/api/src/index.ts) (after `localeMiddleware`).
- **Sliding ~2h idle expiry.** `resolveOrCreateSession(req, res)` helper: read `feed_sid` cookie; if a session exists and `expires_at` is in the future -> bump `expires_at = now + 2h` (keep-alive); else (missing/expired) create a new session and `Set-Cookie` (`HttpOnly`, `SameSite=Lax`, `Secure` in prod, `Path=/`, `maxAge` = 2h) via `@Res({ passthrough: true })`. A returning user past the idle window gets a fresh session -> the `feed_session_views` exclusion set resets and the catalog re-surfaces. Called by `/feed/next` (lazy create — no separate session endpoint) and the like endpoints; every call refreshes both `expires_at` and the cookie `maxAge`. Idle window is a single named constant.
- **CORS/credentials:** enable `credentials: true` + web origin allowlist in [index.ts](apps/api/src/index.ts) CORS, and configure the fetch SDK with `credentials: 'include'` (in `packages/api-clients` runtime config / [clients.ts](apps/web/src/api/clients.ts)). web<->api are same registrable site, so `SameSite=Lax` suffices.

### Endpoints (FeedController) + DTOs (class-validator, Swagger)

- `POST /feed/next` — body `FeedNextDto { previousProduct?: { id: uuid, viewTime: int(ms) }, filters?: FeedFiltersDto }` where `FeedFiltersDto` reuses the catalog dimension fields (`category?: string[]`, `country?: string[]`, `brand?: string[]`) — extract a shared base from `ProductFilterQueryDto` so both endpoints validate identically and feed `buildProductWhere()`. Lazily resolves session (sets cookie), records a view for `previousProduct` (dwell + `filters` context) when present, then returns a single `FeedItemDto` (id, slug, name, priceMinor, currency, images[], videos[], category/brand/country `{slug,label}` hashtags, commentCount, `liked`) or `{ item: null, exhausted: true }`.
- `POST /feed/products/:productId/like` -> add like (restore soft-deleted row if present). `DELETE /feed/products/:productId/like` -> unlike (soft delete). Both read session from cookie.
- `GET /feed/products/:productId/comments` -> `[{ authorName, comment }]` (comment resolved to active locale).
- `GET /feed/likes` -> session's liked product summaries (for the "view liked / unlike" list).

**Route convention:** product-scoped sub-resources are namespaced under `/feed/products/:productId/*` (extensible: future `share`/`save`/`report`/`react`); feed/session-scoped actions stay flat under `/feed/*` (`next`, `likes`). This avoids a bare `:productId` segment colliding with named routes and mirrors the catalog's `products` collection. Feed uses product `:productId` (ids come from `/feed/next`), unlike the catalog's `:slug`.

- Throttler: `/feed/next` fires on every scroll — raise its per-route limit (e.g. `@Throttle` ~120/min) or `@SkipThrottle`.

### Service split

- `FeedSessionService` (lazy resolve/create/refresh cookie session; record view; like toggle), `FeedService` (personalized `next` QueryBuilder + `FeedItemDto` mapping incl. `liked`), `FeedCommentsService` (load comments). Register `FeedModule` in [app.module.ts](apps/api/src/app.module.ts).
- Seed a handful of synthetic `feed_product_comments` (warm, emotional taste impressions, localized) so the feature has content — small seed step alongside the migration.
- Co-located Jest tests in `apps/api/src/tests/application/` mirroring [~products.service.test.ts](apps/api/src/tests/application/~products.service.test.ts): lazy session create/resume/expiry, `next` records `previousProduct` + excludes viewed + hard-filters by body tags + boosts likes, like toggle, comments localization.

### Regenerate client after API is up

`pnpm nx run api:generate:openapi` -> `pnpm --dir apps/web run generate:clients` -> `pnpm nx run api-clients:build`.

## Frontend (`apps/web`)

Mostly client-rendered (personal + interactive), under `[locale]`, **noindex** (`NOINDEX_ROBOTS`). Hashtags live in a **persisted Zustand store**; everything else (current/next item, likes, comments) goes through React Query against the backend. A small local array buffers fetched items to render the vertical pager.

- **Hashtag store:** `apps/web/src/hooks/feed/feed-tags-store.ts` — `create<State>()(persist(...))` mirroring [cart-store.ts](apps/web/src/hooks/cart/cart-store.ts) (`STORE_VERSION`, `partialize`, `migrate`). Persists the canonical grouped `filters: { category: string[], country: string[], brand: string[] }` object (== wire shape) with `addTag(type, value)` / `removeTag(type, value)` / `clear`. A derived selector flattens it into a flat chips view `[{ type, value }]` for rendering (each chip's delete -> `removeTag`). `useFeedNext` sends `filters` directly — no serialization.
- **Route/screen:** `apps/web/src/app/[locale]/feed/page.tsx` (thin, metadata + noindex) -> `apps/web/src/screens/feed/index.tsx` (client). Mirror [catalog page](apps/web/src/app/[locale]/catalog/page.tsx) skeleton minus ISR prefetch.
- **Pager buffer + back/forward (client-side):** the screen keeps `items[]` + a `currentIndex`. Navigating **back** to a previous item, or **forward** to an item already in `items[]`, is purely in-memory — **no request**. `POST /feed/next` fires **only** when advancing past the end of the buffer (into a not-yet-loaded item); the call sends `previousProduct: { id, viewTime }` for the item being left (dwell measured from when it became active) and the appended result becomes the new tail. Consequence: a view (dwell) is recorded only at fetch time for the just-left item — re-views of buffered items aren't separately recorded (acceptable MVP). Recording `previousProduct`'s view right before scoring keeps it excluded from the next candidate, so items never repeat.
- **Feed API layer:** `apps/web/src/api/feed/` (`feed.ts` fetchers + query keys, `feed.hooks.ts`). `useFeedNext` = a **mutation** (POST with body) that sends the store's current `filters` object as-is + `previousProduct {id, viewTime}` and appends the returned item to the local pager buffer; on mount it's called with `filters` only. Like mutations (`POST`/`DELETE /feed/products/:productId/like`) update the item's `liked` + invalidate `GET /feed/likes`. `useFeedComments(productId)` query.
- **FeedCard:** dark full-bleed; `MediaGallery` from `@my-noodles/ui` (handles single/multiple media); bottom overlay = name + price (`useCurrency().formatCurrency`); hashtag chips (category/country/brand) that `addTag` to the store then trigger a fresh `next`; "Детальніше" opens a partial-height bottom `Drawer` with full product info.
- **Action rail (right, Shorts-style):** Like (heart, toggles `/feed/products/:productId/like`, boosts similar), Comments (opens panel), Share (copies/native-shares product page URL via [urls.ts](apps/web/src/shared/seo/urls.ts) `absoluteUrl(localePath(...))` + existing social-share helpers), and below Share a **tags dropdown** of active hashtags (from the store) with remove (widens search).
- **Comments panel:** desktop = sidebar beside the card, same width as the card; mobile = bottom `Drawer` — reuse the responsive `layoutDisplay.mobileOnlyBlock/desktopOnlyBlock` pattern from [filter-sheet.tsx](apps/web/src/components/catalog/filter-sheet/filter-sheet.tsx). Renders comments styled like social posts (auto-avatar: deterministic color + initial from `authorName`), a **disabled** input, and an honest, warm note. Draft copy (to refine): _"Ці враження ми зібрали й оформили самі — щоб передати, як смакує цей продукт. Емоції справжні, як і смак."_
- **Liked list:** entry point near the like action opens a small drawer/panel listing liked products with unlike buttons (`GET /feed/likes` + like toggle).
- **Empty state:** when `next` is exhausted, show active tags + a prompt to remove/clear them to widen the search.
- **Exit:** large white X top-left -> `useRouter().push('/catalog')` via [@/i18n/navigation](apps/web/src/i18n/navigation.ts).
- **i18n:** add `apps/web/messages/feed/uk.json` + `en.json`, register in [messages.ts](apps/web/messages/messages.ts).
- **Tests:** Vitest for feed components (card actions, comments avatar/disclaimer, empty state); follow co-located pattern.

## Validation

Backend: `pnpm nx run api:validate` + `pnpm nx run api:migration:run`. Frontend: `pnpm nx run web:validate`.
