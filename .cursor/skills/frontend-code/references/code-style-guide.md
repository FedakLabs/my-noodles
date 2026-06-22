# Frontend Code Style Guide (my-noodles)

Conventions for `apps/web`. When unsure, grep the nearest analogous module. Architecture: `docs/mvp-plan.md`.

---

## Table of Contents

- [TypeScript Standards](#typescript-standards)
- [Comments](#comments)
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [Performance](#performance)
- [Design & Theme](#design--theme)
- [File Organization](#file-organization)
- [Anti-Patterns](#anti-patterns)

---

## TypeScript Standards

**Always:**

- Strict mode — no implicit `any`
- Export types for public component/hook APIs
- Prefer `unknown` + narrowing over `any`

```ts
// ✅ explicit generics on hooks
export function useProductsList(filters: ProductListFilters) {
  return useQuery({
    queryKey: productsQueryKeys.list(filters),
    queryFn: () => productsApi.listProducts(filters).then((r) => r.data),
  });
}
```

---

## Comments

**Default: no comment.** Names, types, folder layout, and small focused functions should carry the meaning.

**Add a comment only when:**

- Non-obvious **business rules** that are easy to misread (e.g. honeypot field, consent edge case, “why not the obvious fix”)
- A **warning** for future maintainers (ordering constraint, intentional deviation from a library default)

**Avoid:**

- Restating what the code already says (`// increment counter`)
- File/section banners (`// — Support & contact —`) — use naming (`TELEGRAM_SUPPORT_URL`) and blank lines between groups
- Commented-out placeholders for future work — add the export when needed
- Architecture essays in source files — that belongs in `docs/` or skill references, not next to every module

Same bar as `AGENTS.md`: comments are the exception, not the baseline.

---

## Component Patterns

- Functional components + hooks
- **`'use client'`** only when needed (interactivity, RQ, nuqs, Zustand, browser APIs)
- Route **`page.tsx`** stays thin — delegate to `screens/[feature]`
- Pass-through `...props` to root when building reusable pieces
- Composition over deep prop drilling — context only when already established in the feature

---

## State Management

### Server data → TanStack Query

- Hooks in `apps/web/src/api/[feature]/`
- Hierarchical **query-key factories**
- Server Components: prefetch with the same keys → `HydrationBoundary`

### URL state → nuqs

Domain **search params are the source of truth** for shareable filter/sort/pagination state. Layout per feature:

```text
screens/[feature]/search-params/
  parsers.ts   # nuqs parsers + createSearchParamsCache (server-safe)
  types.ts     # CatalogSearchParams, CatalogFilterParams, defaults, appliedKey helpers
  hooks.ts     # useCatalogSearchParams() — wraps useQueryStates + reset/apply helpers
  index.ts     # public barrel
```

- **Server:** `catalogSearchParamsCache.parse(searchParams)` in `page.tsx` for initial prefetch only
- **Client:** `useCatalogSearchParams()` from the barrel — **do not** pass `{ shallow: false }` unless a Server Component must re-render on every URL change (catalog does not; TanStack Query refetches client-side)
- **No mappers in search-params/** — map to API query shapes inside `api/[feature]/` fetchers (`utils.ts`), which accept search-param types directly

```ts
export function useCatalogSearchParams() {
  const [params, setParams] = useQueryStates(catalogSearchParamsParsers);
  // default shallow: true — instant URL sync, no server round-trip per filter change
}
```

### Client-only → Zustand

Use Zustand for **ephemeral client state** that is not server data and should not live in the URL — e.g. cart lines, drawer open/closed, cross-page UI preferences.

**When to pick something else:**

| Need | Use |
| --- | --- |
| API / cacheable data | TanStack Query (`apps/web/src/api/`) |
| Shareable or bookmarkable filters, sort, pagination | nuqs (`screens/[feature]/search-params/`) |
| Scoped to one subtree | Local `useState` / component state |

**Conventions:**

- Stores live in `hooks/[feature]/` — **`cart-store.ts`** (Zustand instance, internal) + **`use-*.ts`** (selector/action hooks) + **`index.ts`** barrel. Screens import `@/hooks/cart`, never the raw store.
- **Persist only what the customer expects across sessions** (`persist` + `partialize`). Ephemeral UI (`panelOpen`, suppression flags, draft toggles) stays in memory — not localStorage.
- **`version` + `migrate`:** bump on shape changes; migrate returns a clean slate instead of patching unknown fields.
- **Actions as store methods;** expose thin hooks for components (`useCartActions`, `useCartItems`) rather than `useCartStore` in screens.
- Do not mirror server entities — RQ owns fetched data; the store holds IDs, quantities, and UI-only fields.
- Reference implementation: `hooks/cart/` (persisted lines + ephemeral panel state).

### UI states (always handle)

Every network-backed surface covers the **full lifecycle**:

| State | Typical signal | UI |
| --- | --- | --- |
| **Loading (initial)** | `isPending && !data` | Skeleton — replaces content |
| **Error** | `isError && !data` | Error copy + retry (`refetch`) |
| **Empty** | success, nothing meaningful to show | Friendly empty state |
| **Data** | success + content | Happy path |
| **Refetching** | `isFetching && !isPending` | Keep stale content visible; soft feedback nearby (see [common-patterns — Initial load vs refetch](./common-patterns.md#initial-load-vs-refetch)) |

```tsx
if (isPending && !data) return <Skeleton />;
if (isError && !data) return <ErrorState onRetry={refetch} />;
if (!items.length) return <EmptyState />;
return <Content isRefetching={isFetching && !isPending} />;
```

While **refetching with stale data** (filter preview, sort change): dim the existing UI and disable interaction — do not remount the panel or fall back to skeleton.

---

## Performance

- ISR/`revalidate` for catalog and product pages per mvp-plan
- RQ caching — don't refetch on every render
- `next/image` for product photos (remote URLs from API)
- Catalog refetch smoothness: `useSmoothBusyState` + grid veil (`ProductGridRefreshVeil`) — debounced in/out overlay while stale data stays visible
- Optimize only when measured — no premature `memo` everywhere

### Loading UI vs SEO (indexable routes)

**SEO-sensitive routes** — home, catalog, product detail, collection landing — must ship **real content in the initial HTML** (product names, links, copy). Crawlers and “View Page Source” should not see route-level skeleton markup.

| Mechanism | SEO-sensitive routes | Non-SEO routes (cart, checkout, …) |
| --- | --- | --- |
| **`loading.tsx`** | **Do not add** | OK for client-nav polish |
| **`<Suspense fallback={…}>`** around async prefetch in `page.tsx` | **Do not use** — streams skeleton into the document | OK when the route is not indexed |
| **`page.tsx` data loading** | `async` page — `await` prefetch, then return `QueryHydrate` + screen | Same or lighter |
| **Loading UX after hydration** | Client screens/components — RQ `isPending` / `isFetching`, inline skeletons, contextual refetch overlays (`ProductGrid`, `FilterSheet`) | Same pattern |

```tsx
// ✅ indexable catalog page — full HTML, no route skeleton
export default async function CatalogPage({ params, searchParams }: PageProps) {
  await prefetchCatalogQueries(/* … */);
  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <CatalogScreen />
    </QueryHydrate>
  );
}

// ❌ indexable page — skeleton can appear in streamed / navigated HTML
export default function CatalogPage(props: PageProps) {
  return (
    <Suspense fallback={<CatalogLoadingFallback />}>
      <CatalogPageContent {...props} />
    </Suspense>
  );
}
```

**Post-hydration loading** belongs in the component that owns the data — grid veil, filter skeletons, inline progress — not route-level `loading.tsx` or global floating indicators.

**SSR + React Query:** `getQueryClient()` must return the **same server instance** for `Providers` and `page.tsx` prefetch (`React.cache` in `shared/query-client/`). Otherwise prefetched catalog data never reaches SSR of client hooks and indexable HTML shows skeletons instead of product cards. Use **`formatUseQuery`** view-state flags (`*IsInitialLoad`, `*IsLoadFailed`, `*IsEmpty`, `*IsRefetching`, `*IsBusy`) instead of hand-rolling `isPending && !data` everywhere — see [Remote data lifecycle](./common-patterns.md#remote-data-lifecycle-loading--error--empty) for screen branching and i18n.

---

## Design & Theme

- **`packages/theme`** — bare tokens and MUI component defaults (`theme.colors.*`, spacing, typography)
- **`packages/ui`** — composed components, icons (`iconStyle` + per-file SVGR imports), skin engine (`resolveSkin` from `@my-noodles/ui`)
- Import **`theme`** from `@my-noodles/theme`; shared UI from `@my-noodles/ui`
- Extend look-and-feel in **`packages/theme/src/components.ts`** (MUI `styleOverrides` / `variants`) so apps reuse defaults instead of repeating `sx`
- Cyrillic fonts: **Unbounded** (display), **Manrope** (body) via `@my-noodles/theme/fonts.css`
- Extract generic composed UI to **`packages/ui`** when reusable across frontend apps (`StableLinearProgress`, `DiscoveryCard`, …)
- Product/collection surfaces: CSS variables from `resolveSkin()` — do not hardcode brand/country accent colors in screens
- **Icons:** `@my-noodles/ui/icons/[name].svg` + `iconStyle({ size, color })` on `style` — not `width`/`height` props or wrapper `color`

---

## File Organization

```text
apps/web/src/
├── app/[locale]/           # routes only
│   ├── layout.tsx
│   ├── providers.tsx
│   └── catalog/page.tsx    # → screens/catalog
├── screens/[feature]/
│   ├── index.tsx
│   └── search-params/      # parsers.ts, types.ts, hooks.ts, index.ts
├── components/[feature]/
├── api/[feature]/           # React Query module (mirrors backend domain folders)
│   ├── [feature].ts         # fetchers + query keys (server-safe, no React)
│   ├── [feature].hooks.ts   # `'use client'` — RQ hooks
│   ├── types.ts             # re-export generated DTOs + query-input types only
│   ├── utils.ts             # optional: request builders
│   └── index.ts             # **public barrel** — only entry point for other layers
├── hooks/[feature]/         # client-state modules (cart, …)
│   ├── [feature]-store.ts   # Zustand store (internal)
│   ├── use-[feature].ts     # public hooks (internal)
│   └── index.ts             # **public barrel** — re-exports hooks + types for reuse
├── utils/
└── shared/                 # env.ts, urls.ts (external links), query-client, seo/
```

**Rules:**

- Layer by technical concern, group by feature inside each folder
- Co-locate `*.test.tsx` with source
- i18n messages in per-locale JSON (path per next-intl setup — verify in repo)
- **`packages/api-clients`** = `@hey-api/openapi-ts` fetch SDK; **`apps/web/src/api`** = React Query layer
- **`api/clients.ts`** — side-effect `setupApiClients(API_URL)`; import from `app/providers.tsx` + root layout
- **`shared/env.ts`** — **single source of truth** for all storefront env vars: one Zod schema, parsed once, named exports (`API_URL`, `SITE_URL`, …). No separate `process.env` reads or env helper files elsewhere. Copy `apps/web/.env.example` → `.env.local`. **Zod-first:** use schema validation, `.transform()`, and `.pipe()` for coercion and normalization; custom parse helpers only as a last resort.
- **`shared/urls.ts`** — external off-origin links (`TELEGRAM_SUPPORT_URL`, …). In-app routes → `@/i18n/navigation`; SEO path builders → `shared/seo/urls`.
- **Test configs** — shared presets in `configs/vitest` (`createBaseVitestConfig`) and `configs/jest` (`createJestConfig`); each app/package keeps a thin config file with project-specific overrides (alias, include globs, env stubs, …).
- **`hooks/locale.ts`** — `useAppLocale()` (next-intl); client API hooks merge locale internally, server fetchers take explicit `locale`

### Module barrels (same idea as backend domains)

Each **`api/[feature]/`** and **`hooks/[feature]/`** folder is a **module**. The **`index.ts`** is the only public surface — it re-exports what other layers may use (hooks, fetchers, query keys, types). Implementation files stay internal.

```ts
// ✅ screens, components, app pages
import { useCreateOrder } from '@/api/orders';
import { useCartActions } from '@/hooks/cart';
import { fetchProductsList, productsQueryKeys } from '@/api/products';

// ❌ deep imports into module internals
import { useCreateOrder } from '@/api/orders/orders.hooks';
import { useCartActions } from '@/hooks/cart/use-cart';
import { fetchProductsList } from '@/api/products/products';
```

- **`index.ts` exports** — hooks, server fetchers, query-key factories, shared types
- **Keep internal** — `*.hooks.ts` vs `*.ts` split, Zustand store instances, `utils.ts` helpers (unless explicitly part of the public API)
- **Cross-module** — always import via `@/api/[feature]` or `@/hooks/[feature]`, not sibling files
- Optional umbrella `@/api` re-exports all domains; prefer **feature barrel** when only one domain is needed (clearer boundaries, better tree-shaking intent)

---

## Anti-Patterns

Grounded in how `apps/web` is actually structured. When in doubt, grep the nearest feature and copy its shape.

| Avoid | Prefer |
| --- | --- |
| Raw generated SDK calls / `fetch` inside screens or components | Server-safe fetchers + query keys in `api/[feature]/[feature].ts`; client hooks in `*.hooks.ts` |
| Deep imports into module internals (`@/api/orders/orders.hooks`, `@/hooks/cart/use-cart`) | Module barrel only: `@/api/orders`, `@/hooks/cart` (see [Module barrels](#module-barrels-same-idea-as-backend-domains)) |
| Duplicating OpenAPI shapes as `*ViewModel` / hand-rolled DTOs | Types from `@my-noodles/api-clients/storefront`; local `types.ts` only for query-input/filter shapes |
| `useState` for catalog filters, sort, or pagination | nuqs in `screens/[feature]/search-params/`; `useCatalogSearchParams()` in client UI; prefetch once in `page.tsx` |
| Mappers from search params in `screens/` | Map in `api/[feature]/utils.ts` inside fetchers; fetchers accept `CatalogSearchParams` / `CatalogFilterParams` |
| Passing `locale` through every screen into hooks | `useAppLocale()` inside `*.hooks.ts`; explicit `locale` only in server prefetch fetchers |
| User-visible strings in JSX | `useTranslations` / `getTranslations`; messages in `apps/web/messages/{locale}.json` |
| `'use client'` on routes, layouts, or presentational wrappers by default | Server Components first; client boundary only for interactivity, RQ, nuqs, Zustand, or browser APIs |
| Business logic and layout mixed in `app/**/page.tsx` | Thin `page.tsx` → `screens/[feature]`; routing shell stays in `app/` |
| Inline defaults for `NEXT_PUBLIC_*` or scattered env parsing (`process.env` outside `env.ts`) | One Zod schema in `shared/env.ts`; import named exports (`API_URL`, `SITE_URL`, …); values in `.env.local` (see `.env.example`) |
| Post-parse string cleanup on env exports (`replace`, `trim`, … outside the schema) | Zod `.transform()` / `.pipe()` on the field in `shared/env.ts` — same pattern as forms and DTO validation |
| Hardcoded external `https://…` in screens/components | Named exports in `shared/urls.ts` (`TELEGRAM_SUPPORT_URL`, …) |
| Comments that narrate obvious code or section banners | Self-explanatory names and structure; comments only for non-obvious business logic or maintainer warnings (see [Comments](#comments)) |
| Long `sx={{ … }}` chains copying colors, radii, or spacing | Theme tokens + MUI variants in `packages/theme`; local `sx` only for one-off layout |
| Query keys missing filter/locale/pagination inputs | Hierarchical key factories (`productsQueryKeys.list(filters)`) matching prefetch and hook |
| Skipping loading, error, or empty UI | Full lifecycle: skeleton → error + retry → empty → data (see [UI states](#ui-states-always-handle)) |
| `loading.tsx` or Suspense fallbacks on home / catalog / product / collection | Async `page.tsx` with awaited prefetch; client loading in `screens/` + `components/` only |
| Global fixed loading indicator for route-local refetch | Contextual feedback near updating content (toolbar + grid veil, filter panel dim) |
| `{condition && <LinearProgress />}` — mount/unmount shifts layout | `@my-noodles/ui` `StableLinearProgress` — reserved slot, `opacity` + `visibility` |
| Premature `memo` / micro-optimizations | Measure first; ISR + RQ caching cover most cases |

---

## Quick checklist

- [ ] Correct layer (`app` / `screen` / `component` / `api` / `hook`)
- [ ] i18n for user-visible text
- [ ] RQ keys include all filter/pagination inputs
- [ ] Client boundary justified
- [ ] Theme tokens, not raw hex
- [ ] No narrating comments — only non-obvious business logic or warnings
- [ ] Tests co-located
- [ ] `pnpm nx run web:fix` passes
- [ ] Indexable routes: no `loading.tsx`, no Suspense around server prefetch in `page.tsx`
