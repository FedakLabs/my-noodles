# Landing Page — Brainstorm (3 concepts to choose from)

## Context

The home route `apps/web/src/screens/home/index.tsx` currently returns `null` — the landing page is greenfield. Per `docs/VISION.md`, this page is **the first act of discovery**: it must make a visitor feel _welcome_, spark the _joy of finding something new_, earn _trust through honesty_, and then hand them into the three ways we let people experience products — all with smooth, inviting motion that itself feels "new."

The platform already has three distinct discovery surfaces the landing must showcase:

- **Collections** (`/collections`) — editorial, mood-curated shelves; trust-by-curation + `isTriedByUs`.
- **Catalog** (`/catalog`) — availability-aware faceted search (country/brand/category/price/tried-by-us/in-stock), dual paginated/infinite grids, and the **flip-to-preview `DiscoveryCard`** that reveals `story` + `forWhom` in-grid.
- **Feed** (`/feed`) — full-screen, dwell-time-personalized, swipeable reel with likes/comments and steerable hashtag filters.

Reusable primitives: `@my-noodles/ui` `DiscoveryCard` / `MediaGallery` / `Carousel`; the **skin system** (`resolveSkin`, brand→country→category→hash cascade); the **View Transitions API** (`viewTransitionName: product-image-${slug}`); product fields `story`, `forWhom`, `isTriedByUs`, `country.flagEmoji`, `alternatives[]`. Palette: warm parchment + terracotta + country/mood accent hues (`packages/theme/src/palette.ts`).

Stack: **Next 16, React 19, MUI 9 + Emotion, nuqs, TanStack Query, next-intl (en/uk)**. No animation library installed — clean slate.

---

## Animation / interaction package menu (novel, on-vision)

Shared candidates the concepts draw from. All mobile-first, all additive to the existing CSS + View-Transitions approach.

- **Motion** (`motion`, the framer-motion successor; `motion/react`) — workhorse for scroll-reveal (`whileInView`), staggers, spring layout. React 19 ready.
- **Lenis** (`lenis`) — buttery inertial smooth-scroll. The signature of award-winning sites; users genuinely "haven't felt this before." ~small, mobile-safe.
- **Native CSS scroll-driven animations** (`animation-timeline: view()`) — cutting-edge, zero-JS reveals/pins; fits the team's hand-rolled-CSS philosophy and is very performant.
- **@formkit/auto-animate** — zero-config list/grid appearance animations; drop-in delight for live product grids.
- **@use-gesture/react** — tactile drag/flick physics (reuse the feed-swipe feel on the landing itself).
- **Rive** (`@rive-app/react-canvas`) — interactive state-machine vector animation; a playful "tasty" noodle mascot that reacts to cursor/scroll. Genuinely uncommon, on-brand. _(Lottie `lottie-react` is the lighter alternative.)_
- **@number-flow/react** — animated number rolls (e.g. "N snacks we've tried ourselves" counting up).
- Optional WebGL flair: **OGL** (tiny) for a soft "liquid/gooey" tinted background that picks up the hovered product's skin color.

---

## Concept A — "The Tasting Table" (warm editorial scroll-story)

**Metaphor:** walking into a warm shop and being gently guided to a tasting table. A cinematic vertical scroll-story, collections/warmth-led. Lowest risk, strongest on "welcome & warmth."

**Sections:**

1. **Welcome in (hero)** — parchment warmth; one craving-building line ("Everything looks so tasty — what should you try today?"). A slow ambient drift of a few skinned product cards, each wearing its country color. CTA "Start exploring." Optional Rive noodle mascot peeking. Lenis makes the first downward scroll feel inviting.
2. **What you came for** — the human truth in one line; word-by-word reveal on scroll (Motion stagger).
3. **Three ways to find your new favorite** (centerpiece) — three "doors," each a _live_ animated mini-preview: Collections shelves fanning out; a Catalog filter-chip demo where tapping a country flag reshuffles a mini grid (auto-animate); an autoplaying mini swipeable Feed reel.
4. **We've tried it ourselves** — honesty/trust; a real `DiscoveryCard` that flips to preview (`story` + `forWhom`); `isTriedByUs` badge; a `@number-flow` "N tried by us" counter.
5. **Around the world** — flag strip; each flag is a portal into `/catalog?country=…`, skins on display.
6. **Final invitation** — big CTA into Feed/Catalog, warm sign-off, Telegram human.

**Packages:** Lenis + Motion (`whileInView`) + native scroll-driven CSS + auto-animate + optional Rive. **Risk:** low. **Best at:** welcome, warmth, curation-first storytelling.

---

## Concept B — "Choose Your Door" (interactive tactile playground)

**Metaphor:** the landing _is_ the first act of discovery — a playground that reacts to cursor/touch. Three living portals (Collections/Catalog/Feed) as physical, draggable objects. Most experimental / "you haven't experienced such a platform."

**Sections:**

1. **Hero playground** — full-viewport. Three big tactile portal-cards you can drag/flick (use-gesture + Motion springs). A soft gooey/liquid background (OGL or CSS) tinted by whichever portal you hover — the skin system leaking onto the whole page. Headline reacts to hover.
2. **Feel it (mini-interactions)** — hovering Feed shows a swipe hint; Catalog shows filter chips assembling live; Collections shows shelves stacking. Each is a genuine functional teaser.
3. **Surprise me** — a button that pulls one _live_ product from the feed API and flips it in with skin + `story` + tried-by-us badge (reuse `DiscoveryCard` + View Transitions). Instant taste of the spark.
4. **Trust ribbon** — honesty pillars as playful tactile chips.
5. **Country marquee** — grabbable infinite marquee of flag-skinned cards.
6. **CTA** — "Pick your door" → routes into the surface via View Transition.

**Packages:** @use-gesture + Motion (springs) + OGL/CSS liquid + optional Rive + View Transitions. **Risk:** high (effort + mobile perf care). **Best at:** novelty, "living playful interface," wow-factor.

---

## Concept C — "Living Reel Welcome" (feed-first immersive)

**Metaphor:** lead with our most distinctive asset — the feed. The page opens as an ambient auto-advancing cinematic reel of hero products (video-first, full-bleed, skinned), welcome copy overlaid like subtitles. "Netflix for novelty" made literal. On scroll, the reel "docks" into a normal page revealing the other doors + trust. Most mobile-native / dopamine-forward.

**Sections:**

1. **Hero = ambient auto-reel** — full-viewport cinematic autoplay of 4–5 curated hero products (video/image via `MediaGallery`), each fully skinned, gently cross-fading with parallax. Overlaid welcome line changes per product ("A Korean fire noodle… a Japanese matcha KitKat…"). "Swipe up to explore" cue. This _is_ the feed experience, previewed.
2. **Scroll dock transition** — the fullscreen reel scales/docks into a framed device-like card (scroll-driven CSS / View Transition) as the page reveals itself: "this immersive thing lives inside."
3. **Three moods, three ways** — compact Collections/Catalog/Feed trio with looping micro-previews.
4. **Honesty & tried-by-us** — `story`/`forWhom` sample card.
5. **Country / mood strip.**
6. **CTA** — "Start the reel" → Feed, or into Catalog.

**Packages:** Motion (cross-fade/parallax) + native scroll-driven CSS (dock) + Lenis + View Transitions + existing `MediaGallery` autoplay. **Risk:** medium. **Best at:** showcasing the unique feed, mobile-native, dopamine.

---

## Decision (confirmed)

**Build all three variants** and A/B test them — let Hotjar (added later, via GTM) + existing GTM/GA4 decide the winner rather than betting on one design up front. Ambition is spread across them:

| Variant | Concept             | Ambition                                                                                |
| ------- | ------------------- | --------------------------------------------------------------------------------------- |
| **A**   | Tasting Table       | **Balanced** — Lenis + Motion + scroll-driven CSS                                       |
| **C**   | Living Reel Welcome | **In-between** — solid motion base + one novel touch (scroll-dock via View Transitions) |
| **B**   | Choose Your Door    | **Bold & novel** — gesture physics + WebGL liquid + Rive                                |

This means the build has two layers:

1. **An experiment harness** — serve one sticky variant per visitor, code-split so each visitor only downloads their variant's JS + animation libs, push the assigned variant into `window.dataLayer` (`landing_variant`) so GTM/Hotjar can segment, with a `?lp=a|b|c` override for QA. (Detailed design pending Plan agent.)
2. **The three landing builds** — sections, components, reused primitives, and per-variant packages. (Detailed design pending Plan agent.)

Detailed architecture, file layout, package list, and verification path are being filled in below from the design agents.

---

## Implementation architecture

### Layer 2 — the three landing builds

**Shared foundations** (build once, in `apps/web/src/screens/home/_shared/`):

- `use-reduced-motion.ts` — `useMediaQuery('(prefers-reduced-motion: reduce)')`. **New** (none exists). Every motion primitive reads it.
- `section-reveal.tsx` — `SectionReveal` wrapper over `motion.div` (`whileInView`, `once`, stagger); renders static `Box` under reduced-motion.
- `use-landing-hero-products.ts` — wraps `useProductsList({ isTriedByUs:true, inStock:true, limit:N })`. **GET query → SSR-prefetchable.** Feeds A's drift cards, C's reel pool, B's teasers. (The feed `/next` POST is deliberately NOT used for load-time content.)
- `use-tried-by-us-count.ts` — `useProductsList({ isTriedByUs:true, limit:1 })`, read `meta.total`.
- `use-country-portals.ts` — `useProductFacets(...)` → country facets (`name/code/flagEmoji/themeKey/count`).
- `live-product-peek.tsx` — `LiveProductPeek`: landing-tuned distillation of `product-card.tsx` (`resolveSkin`, `useDiscoveryCardView` flip, lazy `useProductDetail` on preview, `story`/`forWhom` + tried-by-us badge). Reused by A4, C4, B3.
- `use-lenis.ts` — mounts Lenis on scroll root; **no-ops under reduced-motion**; A + C only; never on immersive feed route.
- `skin-backdrop.ts` — turns `resolveSkin().definition` into gradient CSS (A hero ambiance, B liquid tint).
- `home-cta.tsx` — shared warm CTA + Telegram block.

**Page wiring:**

- `app/[locale]/page.tsx` — mirror the catalog SSR pattern (`getQueryClient()` → `runPrefetchSafe()` → `fetchQuery` → `QueryHydrate` w/ `dehydrate`). Prefetch **only the assigned variant's** GET queries (collections list, curated products, facets). Feed-driven sections excluded (POST, can't dehydrate).
- `screens/home/index.tsx` — becomes the variant switch; each variant lazy-loaded via `next/dynamic` so a visitor downloads only their variant + its libs.

**Variant A "Tasting Table" (Balanced)** — `screens/home/variants/tasting-table/`

1. `hero-craving` — welcome + `ambient-card-drift` (4–6 lightweight skinned tiles drifting via `motion`).
2. `human-truth` — word-by-word reveal (`motion` stagger; reduced-motion → single fade).
3. `three-doors` — `door-collections-shelf` (fanning shelves from `useCollections`), `door-catalog-chips` (tappable chip demo reshuffling a mini grid via **`@formkit/auto-animate`**), `door-feed-reel` (autoplaying mini reel via **`embla-carousel-autoplay`**, muted/`playsInline`, links `/feed`).
4. `tried-by-us` — `LiveProductPeek` + animated "N tried by us" count-up.
5. `around-the-world` — flag portals → `/catalog?country=CODE`.
6. `warm-cta` — `HomeCta`. Optional deferred Rive mascot.

- **Packages:** `motion`, `lenis`, `@formkit/auto-animate`, `embla-carousel-autoplay`, optional `@rive-app/react-canvas`.

**Variant C "Living Reel Welcome" (In-between)** — `screens/home/variants/living-reel/`

1. `hero-reel` — full `100dvh` ambient auto-reel of 4–5 curated hero products; `motion` cross-fade + parallax; per-product changing welcome line; "swipe up" cue; video muted/`playsInline`; auto-advance via `embla-carousel-autoplay`. Uses prefetched curated pool (not `/feed/next`).
2. `scroll-dock` — reel scales into a framed card. **Native CSS `animation-timeline: view()` with a required `motion` `useScroll`/`useTransform` fallback** (iOS Safari lacks scroll-driven animations), feature-detected via `CSS.supports(...)`.
3. `three-moods` — compact Collections/Catalog/Feed trio w/ looping micro-previews.
4. `honesty-tried` — `LiveProductPeek` sample.
5. `country-mood-strip` — `useCountryPortals` → `/catalog?country=`.
6. `start-reel-cta` — "Start the reel" → `/feed` via `document.startViewTransition` (progressive enhancement), reusing existing `product-image-${slug}` shared-element names.

- **Packages:** `motion`, `lenis`, `embla-carousel-autoplay`. View Transitions + scroll-driven CSS = native.

**Variant B "Choose Your Door" (Bold & novel)** — `screens/home/variants/choose-your-door/`

1. `portal-playground` — full `100dvh`; three `portal-card`s draggable/flickable via **`@use-gesture/react`** + `motion` springs (rubber-band return), each skinned; `liquid-backdrop` tinted by hovered portal's skin — **CSS/SVG animated gradient is the shipping default; `ogl` WebGL is optional, `ssr:false`, desktop + non-reduced-motion only.**
2. `feel-it-teasers` — per-portal looping micro-teasers.
3. `surprise-me` — the one legitimate live call: `feedMutations.next()` via `useMutation` on click, flip result in as `LiveProductPeek` (skin + story + tried-by-us); own loading state; fallback to curated pool on error.
4. `trust-ribbon` — playful honesty chips.
5. `country-marquee` — grabbable drag-to-scroll marquee (`@use-gesture`), links `/catalog?country=`.
6. `pick-your-door-cta` — routes via `document.startViewTransition`. Optional deferred Rive mascot.

- **Packages:** `@use-gesture/react`, `motion`, optional `ogl` (desktop-only/dynamic), optional `@rive-app/react-canvas`.

### Package matrix

- **Shared:** `motion` (all three; `motion/react`), `lenis` (A/C, gated), `embla-carousel-autoplay` (A/C; plugs into existing `embla-carousel-react`).
- **Per-variant:** `@formkit/auto-animate` (A), `@use-gesture/react` (B), `ogl` (B, optional/desktop/dynamic), `@rive-app/react-canvas` (A+B, optional/deferred).
- **Native, no package:** View Transitions API (B/C), CSS scroll-driven animation (A/C — always paired with a `motion` fallback for iOS Safari).
- **Bundle strategy:** `next/dynamic` per variant; `ogl` + Rive further dynamic-imported inside their variant so they never enter the initial chunk.

### Compatibility callouts

- `motion` (framer-motion successor) supports React 19 via `motion/react`; client-only. Keep motion props and MUI `sx` separate.
- Emotion SSR already handled by `AppRouterCacheProvider` (root layout).
- **CSS scroll-driven animation is Chromium-only (not iOS Safari)** → mandatory `motion` fallback; treat native as progressive enhancement.
- **View Transitions**: use `document.startViewTransition(() => router.push(...))` guarded by feature-detect; never block navigation.
- Autoplay video needs `muted + playsInline + autoPlay` (iOS); only the active slide plays; posters + `preload` to protect mobile data. `@use-gesture` handlers set `touch-action`/axis-lock (mirror `use-feed-swipe.ts`) so page scroll survives.

### Layer 1 — the experiment harness

Serve one sticky variant per visitor, SSR'd with no flash, code-split, and tagged for GTM/Hotjar segmentation.

**Assignment — wrap the existing `apps/web/src/proxy.ts`** (Next 16 renamed `middleware.ts`→`proxy.ts`; a single proxy runs, and next-intl already lives here — so we modify it, do NOT add `middleware.ts`). Middleware is the right layer because a Server Component can read but not _set_ a cookie, so first-visit sticky assignment must happen before render:

```ts
const handleI18n = createMiddleware(routing);
export default function proxy(request) {
  const { variant, source } = resolveAssignment(request); // query > cookie > random
  request.cookies.set(LANDING_COOKIE, variant); // BEFORE delegating → same-request SSR on direct /uk hit
  const response = handleI18n(request); // next-intl rewrite OR 307 locale redirect
  response.cookies.set(LANDING_COOKIE, variant, LANDING_COOKIE_OPTIONS); // persist, survives redirect hop
  response.headers.set('x-lp-source', source);
  return response;
}
export const config = { matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)' }; // UNCHANGED — next-intl needs it
```

- **Precedence** (in edge-safe `shared/experiment/assign.ts`): `?lp=a|b|c` (pins cookie too, `source:'query'`) > existing `lp` cookie (`'cookie'`) > uniform random via `crypto.getRandomValues` (`'assigned'`).
- **Two entry paths, both flash-free:** direct `/uk` — request cookie mutated before delegating so the same-request RSC sees the bucket; bare `/` — next-intl 307-redirects, cookie set on the redirect response, browser re-requests `/uk` with the cookie present (sticky, agrees across hops).
- Only `page.tsx` reading `cookies()` opts the home route into dynamic rendering; other routes stay static. Ensure any CDN does not cache the per-visitor home HTML.

**Selection + code-split:** `page.tsx` reads the variant via a `server-only` helper (`shared/experiment/get-landing-variant.ts`), prefetches only that variant's GET queries, and passes `variant`/`source` to `HomeScreen`, which maps to a `next/dynamic` import per variant (**keep `ssr:true`** — `ssr:false` reintroduces flash). Each visitor downloads only their variant's chunk + libs.

**Analytics tagging:** add a consent-gated `trackLandingVariant(variant, source)` in `shared/analytics/track.ts` (routes through existing `pushCustomEvent` → `isAnalyticsAllowed()`), firing event **`landing_variant_assigned`** with params `landing_variant` (`a|b|c`, the segmentation key) and `landing_variant_source` (`query|cookie|assigned`, to exclude QA-forced sessions). Fired once by a small `'use client'` `landing-experiment-tracker.tsx` when consent becomes `granted`. GTM side (config, later): Data Layer Variable on `landing_variant` + trigger the Hotjar tag on `landing_variant_assigned`, then use it as a Hotjar session attribute / GA4 custom dimension.

**i18n:** shared `home` namespace with variant sub-keys — `messages/home/{en,uk}.json` → `variants.{a,b,c}.*` (all namespaces already ship fully client-side, so a separate namespace buys no bundle savings; keeps the diff to two files; cleanup is a single prune).

**New/modified files (harness):** modify `proxy.ts`, `app/[locale]/page.tsx`, `screens/home/index.tsx`, `shared/analytics/track.ts` + `index.ts`, `i18n/messages/home/{en,uk}.json`; new `shared/experiment/{config,assign,get-landing-variant}.ts`, `screens/home/variant-selector.tsx`, `screens/home/landing-experiment-tracker.tsx`.

**Retiring losers later:** delete the two losing `variants/` folders + their `variants.*` copy keys, simplify the selector to render the winner, and revert `proxy.ts` to the plain `createMiddleware(routing)` export.

---

## Build sequence

1. **Harness + shared foundations** — `proxy.ts` wrap, `shared/experiment/*`, `page.tsx` prefetch + variant switch, `trackLandingVariant`, `home` i18n sub-keys; plus `_shared/*` (`useReducedMotion`, `SectionReveal`, hero/count/country hooks, `LiveProductPeek`, `useLenis`). Unblocks all variants and sets the fast-by-default data path.
2. **Variant A** (lowest risk; exercises `SectionReveal`/`LiveProductPeek`/autoplay reel/auto-animate).
3. **Variant C** (adds dock scroll + `motion` fallback + View Transition; reuses A's reel + peek).
4. **Variant B** (highest risk; build CSS-liquid + reduced-motion paths first, layer `ogl`/Rive last as optional enhancements).

## Verification

- **Assignment/stickiness:** load `/` in a clean session → lands on `/uk` with an `lp` cookie; reload keeps the same variant; `?lp=a`, `?lp=b`, `?lp=c` each force + pin the corresponding variant. No content flash / no hydration warning in console on first paint (view-source shows the correct variant SSR'd).
- **Code-split:** DevTools Network shows only the assigned variant's chunk (and only its libs — e.g. `ogl`/gesture only under B) downloaded.
- **Analytics:** with consent granted, `window.dataLayer` contains one `landing_variant_assigned` with correct `landing_variant`/`landing_variant_source`; nothing pushed before consent.
- **Motion/mobile:** run each variant with `prefers-reduced-motion: reduce` (DevTools rendering emulation) → static fallbacks, Lenis off, autoplay off, VT falls back to instant nav. Test C's dock + A's reveals on an iOS Safari viewport (or a browser without `CSS.supports('animation-timeline: view()')`) to confirm the `motion` fallback drives the effect. Confirm muted+`playsInline` videos autoplay on mobile and page scroll survives around B's draggable cards.
- **Run the app** (`/run` skill or the repo dev command) and screenshot each of `/uk?lp=a|b|c` on mobile + desktop widths.
- **Tests/build:** `pnpm --filter web build` (surfaces dynamic-rendering/import issues), `pnpm --filter web test` (vitest), and lint/typecheck per repo scripts.
