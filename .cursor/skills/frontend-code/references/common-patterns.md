# Common Patterns — Frontend (my-noodles)

Task recipes for `apps/web`. **Grep the repo first** and copy the nearest feature. Read [code-style-guide.md](./code-style-guide.md) first.

---

## Table of Contents

1. [Theme & layout](#1-theme--layout)
2. [Forms (react-hook-form + Zod)](#2-forms-react-hook-form--zod)
3. [React Query hooks](#3-react-query-hooks) — includes [Remote data lifecycle](#remote-data-lifecycle-loading--error--empty), [Initial load vs refetch](#initial-load-vs-refetch)
4. [Route + screen (Next.js App Router)](#4-route--screen-nextjs-app-router)
5. [URL filters (nuqs)](#5-url-filters-nuqs)
6. [i18n (next-intl)](#6-i18n-next-intl)
7. [Client state (Zustand)](#7-client-state-zustand)
8. [Feature-scoped React Context](#8-feature-scoped-react-context)
9. [New presentational component](#9-new-presentational-component)
10. [Custom hook](#10-custom-hook)
11. [External URLs](#11-external-urls)
12. [Testing](#12-testing)

---

## 1. Theme & layout

```tsx
'use client';

import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <Stack spacing={theme.customSpacing.gap.small}>
      <Typography variant="h4">{children}</Typography>
    </Stack>
  );
}
```

- Wrap pages with existing layout from `screens/` or `app/[locale]/layout.tsx`
- Product/collection cards: apply skin CSS variables from `resolveSkin()` (`@my-noodles/ui`) at the card root

### Mobile vs desktop layout split

Shell layout (sidebar vs drawer, horizontal nav vs hamburger) uses semantic breakpoints **`mobile`** / **`desktop`** in `@my-noodles/theme` — both bound to **`DESKTOP_MIN_WIDTH`** (900px). Change that constant once to retune the split everywhere.

**JS (conditional render, mount one panel):**

```tsx
import { useViewport } from '@/hooks/layout';

const { isDesktop, isMobile } = useViewport();
```

**`sx` (show/hide by viewport):**

```tsx
import { layoutDisplay } from '@my-noodles/theme';

<Drawer sx={{ display: layoutDisplay.mobileOnlyBlock }} />
<Stack sx={{ display: layoutDisplay.desktopOnlyFlex }} />
<Box sx={{ px: { mobile: 1, desktop: 1.5 } }} />
```

Keep MUI **`xs` / `sm` / `md`** for density grids (e.g. product card columns `{ xs: 6, sm: 4, md: 3 }`) — those are not the mobile/desktop shell split.

### Progressive disclosure (smooth layout shifts)

When part of the UI can grow or shrink by a **large amount** — filter “show all”, long product descriptions, expandable detail blocks — **do not mount/unmount the extra content instantly**. A sudden height jump feels jarring and makes the page hard to follow.

**Default:** wrap the revealed block in MUI **`Collapse`**. Keep the stable summary (first N items, teaser copy, toggle control) outside; animate only the delta.

```tsx
'use client';

import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';

import { usePrefersReducedMotion } from '@/hooks/smooth/use-prefers-reduced-motion';

export function ExpandableBlock({ expanded, teaser, rest }: {
  expanded: boolean;
  teaser: React.ReactNode;
  rest: React.ReactNode;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Stack spacing={1}>
      {teaser}
      <Collapse in={expanded} timeout={prefersReducedMotion ? 0 : undefined} sx={{ width: '100%' }}>
        <Stack component="div" sx={{ width: '100%' }}>
          {rest}
        </Stack>
      </Collapse>
    </Stack>
  );
}
```

**Rules:**

- **`Collapse` for height changes** — catalog filter facets (`filter-facet-group.tsx`), playful load-more copy (`catalog-load-more.tsx`)
- **`usePrefersReducedMotion()`** → `timeout={0}` so expand/collapse is instant when the customer prefers reduced motion
- **Keep toggles outside** the collapsing region so “Show all / Show less” stays reachable while height animates
- **Pinned selections when collapsed** — if collapsed UI must still show active choices (e.g. selected filters beyond the first N), render them outside the collapse; put only the hidden remainder inside `Collapse` (see `filter-facet-group.tsx`)
- **`unmountOnExit`** — only when removed content is decorative and remount cost is low (load-more waiting line); keep filter/checkbox lists mounted so focus and state stay stable
- **Not for loading** — skeletons, progress bars, and refetch veils use [Initial load vs refetch](#initial-load-vs-refetch) patterns instead

---

## 2. Forms (react-hook-form + Zod)

Define a **Zod schema that matches the mutation input** — no separate mapper layer unless merging unrelated sources (e.g. cart lines + form fields into one DTO).

**Zod-first (forms, env, and any input boundary):** prefer schema validation, `.transform()`, and `.pipe()` for coercion and derived shapes. Custom parse helpers are a fallback when Zod cannot express the rule cleanly — not the default.

### File layout

```text
components/checkout/
├── validation.ts          # zod schema + inferred types
├── checkout-form.tsx
└── checkout-form.test.tsx
```

### Schema

```ts
import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  city: z.string().trim().min(1),
  branch: z.string().trim().min(1),
  company: z.string().max(0).optional(), // honeypot — must stay empty
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
```

### Form

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

export function CheckoutForm() {
  const t = useTranslations('checkout');
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { customerName: '', phone: '', city: '', branch: '', company: '' },
  });

  const { createOrder, createOrderIsPending } = useCreateOrder();

  const onSubmit = form.handleSubmit((data) => {
    createOrder(data);
  });

  return <form onSubmit={onSubmit}>{/* Controller + TextField fields; labels via t('fields.name') */}</form>;
}
```

Server-side field errors: map API 400 to `form.setError` when the backend returns structured validation.

---

## 3. React Query hooks

**Location:** `apps/web/src/api/[feature]/` — import from **`@/api/[feature]`** (the module `index.ts`), not from `*.hooks.ts` / `*.ts` directly.

- **`[feature].ts`** — query-key factories + async fetchers (importable from Server Components for prefetch)
- **`[feature].hooks.ts`** — `'use client'` hooks only; wrap results with `formatUseQuery` / `formatUseMutation`

Uses **`packages/api-clients`** via one-time init in `api/clients.ts` (`setupApiClients(API_URL)` from `shared/env.ts`; imported from `app/providers.tsx` and root layout). All env vars — including `SITE_URL` for SEO — come from `shared/env.ts` only (normalized in the Zod schema, e.g. trailing slash stripped via `.transform()`).

### Types: generated DTOs first

We own the storefront API — **`apps/web/src/api` should not mirror response shapes**. Use generated models from `@my-noodles/api-clients/storefront` (`ProductSummaryDto`, `CountryDto`, …) in hooks, screens, and components.

**`types.ts` in each feature folder is for:**

- Re-exporting generated DTOs (barrel for consumers)

**Query inputs use domain search-param types** — import `CatalogSearchParams` / `CatalogFilterParams` from `@/screens/catalog/search-params`. Do not duplicate filter shapes in `api/`.

**Custom types / mappers (`utils.ts`) only when there is a critical architectural reason**, e.g.:

- Merging multiple API responses into one UI-specific shape
- Normalizing a third-party API we do not control
- Deliberately hiding fields the UI must never see

Do **not** add `*ViewModel` duplicates of our own DTOs — that creates drift with no benefit.

```ts
// products.ts — server-safe fetchers + query keys (no React hooks)
import { productsControllerList, type PaginatedProductsDto } from '@my-noodles/api-clients/storefront';

import type { CatalogSearchParams } from '@/screens/catalog/search-params';

import { requestData } from '@my-noodles/web-lib/react-query';
import { searchParamsToListQuery } from './utils';

export const productsQueryKeys = {
  all: ['products'] as const,
  list: (params: CatalogSearchParams, locale: AppLocale) =>
    [...productsQueryKeys.all, 'list', locale, params] as const,
};

export async function fetchProductsList(params: CatalogSearchParams): Promise<PaginatedProductsDto> {
  return requestData(productsControllerList({ query: searchParamsToListQuery(params) }));
}
```

```ts
// products.hooks.ts — client hooks resolve locale internally
'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { CatalogFilterParams, CatalogSearchParams } from '@/screens/catalog/search-params';
import { useAppLocale } from '@/hooks/locale';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { fetchProductFacets, fetchProductsList, productsQueryKeys } from './products';

export function useProductsList(params: CatalogSearchParams) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.list(params, locale),
      queryFn: () => fetchProductsList(params),
    }),
    'products',
  );
}

export function useProductFacets(params: CatalogFilterParams) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.facets(params, locale),
      queryFn: () => fetchProductFacets(params, locale),
      placeholderData: keepPreviousData,
    }),
    'productFacets',
  );
}
```

```ts
// orders.hooks.ts
'use client';

import { useMutation } from '@tanstack/react-query';

import { formatUseMutation } from '@my-noodles/web-lib/react-query';
import { createOrder } from './orders';

export function useCreateOrder() {
  return formatUseMutation(useMutation({ mutationFn: createOrder }), 'createOrder');
}
```

**Hook result naming** — use `formatUseQuery` / `formatUseMutation` from `@my-noodles/web-lib/react-query` so destructuring is prefixed (`products`, `productsIsPending`, `productsIsInitialLoad`, `createOrder`, `createOrderIsPending`, …).

For infinite catalog lists, use `pagePaginatedGetNextPageParam` + `formatUseInfiniteQuery` with our `{ items, meta: { page, limit, total } }` shape.

**Rules:**

- Return SDK data as-is for our API — use `requestData()` from `@my-noodles/web-lib/react-query` in fetchers; global `throwOnError: true` in `packages/api-clients/.../runtime.config.ts`
- **Client hooks** call `useAppLocale()` for query keys — do not pass `locale` from screens/components; fetchers are locale-free (interceptor sets `x-app-locale` from Zustand)
- **Server prefetch / fetchers** wrap work in `runWithAppLocale(locale, …)` — AsyncLocalStorage feeds the same interceptor on SSR
- Use generated enums (`ProductSort`, `DeliveryProvider`, …) — do not hand-roll constants in `api-clients`
- Catalog **facets preview** and product **list** use **separate keys** (facets = `CatalogFilterParams`, no page/limit; list = full `CatalogSearchParams`)
- Mutations invalidate the smallest relevant key set
- Server Component prefetch: same `queryKey` + `queryFn` → dehydrate into `HydrationBoundary` (initial load / hard refresh only — not on every client filter change)
- `utils.ts` = map search params → generated `*Data['query']` inside fetchers; not exported unless needed
- Do **not** call generated SDK functions from screens/components — go through `apps/web/src/api`

### Remote data lifecycle (loading / error / empty)

Most screens and several **remote-backed components** (product detail, collection header, filter preview, product grid) do **not** have their data on first render. Data comes from the API — prefetched on the server when possible, then owned by TanStack Query on the client. That fetch can **take time**, **fail**, or **return nothing**. Plan UI for all three outcomes up front; do not branch on raw `isPending` / `isError` / `!data` in every screen.

**Source of truth:** `deriveQueryViewState` in `@my-noodles/web-lib/react-query`, exposed on every `formatUseQuery` result:

| Flag | When true | UX role |
| --- | --- | --- |
| `*IsInitialLoad` | First fetch, no cached data yet | **Loading** — skeleton or short inline copy |
| `*IsLoadFailed` | Query errored with no cached data | **Error** — failure message; retry when actionable |
| `*IsEmpty` | Settled with no entity (`!data`, not pending/fetching/error) | **Empty / not found** — friendly “nothing here” (not the same as error) |
| `*IsRefetching` | TanStack Query native — background refetch while data is visible |
| `*IsBusy` | `isPending \|\| isFetching` | Disable actions, “searching…” labels |

These flags are **mutually exclusive for the three main UX states** on a cold load: loading → then exactly one of success (render data), error, or empty.

**Screen recipe** — one branch per outcome, separate i18n keys (`loading`, `error`, `empty`):

```tsx
'use client';

const { product, productIsInitialLoad, productIsLoadFailed, productIsEmpty } = useProductDetail(slug);

if (productIsInitialLoad) {
  return <PageContainer><Typography color="text.secondary">{t('loading')}</Typography></PageContainer>;
}

if (productIsLoadFailed) {
  return <PageContainer><Typography color="error">{t('error')}</Typography></PageContainer>;
}

if (productIsEmpty) {
  return <PageContainer><Typography color="text.secondary">{t('empty')}</Typography></PageContainer>;
}

if (!product) {
  return <PageContainer><Typography color="text.secondary">{t('loading')}</Typography></PageContainer>;
}

// product is defined — render the happy path
```

Same pattern on **collections**, **filter-sheet** (skeleton / error panel / empty facets message), and **catalog grid** (`productsIsLoadFailed` for list failure; grid empty state for zero items after success).

**Do not** conflate error and empty:

- **`error`** — “Couldn’t load …” (network, 5xx, or thrown client). User may retry.
- **`empty`** — “Not found” or legitimately no rows. No retry unless filters can change.

**Do not** write `*IsEmpty || !entity` for the empty branch — `*IsEmpty` already means settled with no data. The extra `!entity` check is redundant for empty UX and can mis-route a rare in-flight-no-cache state to empty copy. Use `*IsEmpty` alone for empty; if `!entity` remains after that, treat it as loading/busy (then TypeScript narrows for the happy path).

**404 vs empty today:** if the fetcher throws on 404 (`requestData`), TanStack Query sets `isError` → `*IsLoadFailed`, not `*IsEmpty`. Map 404 to empty at the fetch layer only if product wants not-found copy instead of error copy.

**Lists vs single entity:**

- **Entity screen** (product, collection): `*IsEmpty` for not-found / missing entity — not `*IsEmpty || !entity`.
- **List/grid** (catalog): after load, **zero items** is usually domain empty (`products.items.length === 0`) with copy like `catalog.emptyState` — not `*IsEmpty` on the query (the query succeeded with an empty page).

**Prefetch + hydration:** server `page.tsx` may dehydrate data so the client often **skips** `*IsInitialLoad` on first paint. Flags still matter for client navigations, hard refresh without cache, and refetch.

### Initial load vs refetch

Distinguish **first fetch** from **background refetch** — different UX, same query hook. Prefer `*IsInitialLoad` / `*IsRefetching` from `formatUseQuery` over hand-rolling `isPending && !data`.

| Phase | Signal | UX |
| --- | --- | --- |
| **First visit** | `*IsInitialLoad` | Full skeleton (e.g. `ProductGridSkeleton`, `FilterSheetSkeleton`) |
| **Filter/sort/page change** | `*IsRefetching` | Keep stale content visible; soft overlay nearby |

**Catalog refetch recipe** (`ProductGrid` + `FilterSheet`):

- Toolbar: status text → `catalog.filters.searching` + `StableLinearProgress` from `@my-noodles/ui`
- Grid: dim + frosted veil — not per-card shimmer
- Lifecycle: `useSmoothBusyState` — debounced enter, eased exit; fast refetches stay invisible
- Filter panel preview: opacity dim + `pointer-events: none` while `productFacetsIsRefetching`

**Inline progress:** always render `StableLinearProgress`; toggle `active` — never mount/unmount (avoids layout shift).

**Feedback placement:** near the content being updated — not a global floating pill.

```tsx
const { products, productsIsInitialLoad, productsIsRefetching } = useProductsList(params);

if (productsIsInitialLoad) return <ProductGridSkeleton />;
// … render stale products; pass productsIsRefetching to grid veil / toolbar
```

---

## 4. Route + screen (Next.js App Router)

**Split:** `app/[locale]/` owns routing, locale guards, metadata, prefetch, and search-param parsing. `screens/[feature]/` owns layout and composition.

```tsx
// app/[locale]/catalog/page.tsx
import { fetchProductFacets, fetchProductsList, productsQueryKeys } from '@/api/products';
import { CatalogScreen } from '@/screens/catalog';
import { catalogSearchParamsCache } from '@/screens/catalog/search-params';

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const searchParamsParsed = await catalogSearchParamsCache.parse(searchParams);
  const { page: _page, limit: _limit, ...filterParams } = searchParamsParsed;

  // Prefetch once for hydration; client filter changes refetch via TanStack Query (shallow URL updates)
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productsQueryKeys.list(searchParamsParsed, locale),
      queryFn: () => fetchProductsList(searchParamsParsed, locale),
    }),
    queryClient.prefetchQuery({
      queryKey: productsQueryKeys.facets(filterParams, locale),
      queryFn: () => fetchProductFacets(filterParams, locale),
    }),
  ]);

  return <CatalogScreen />;
}
```

```tsx
// screens/catalog/index.tsx
'use client';

import { useProductsList } from '@/api/products';
import { useCatalogSearchParams } from '@/screens/catalog/search-params';

export function CatalogScreen() {
  const { params, setParams } = useCatalogSearchParams();
  const { products, productsIsInitialLoad, productsIsLoadFailed } = useProductsList(params);
  // … branch on productsIsInitialLoad / productsIsLoadFailed per [Remote data lifecycle](#remote-data-lifecycle-loading--error--empty)
}
```

Every `page.tsx`: validate locale → `setRequestLocale` → optional prefetch → render one screen component.

**SSR + React Query:** use the shared per-request `getQueryClient()` (see `shared/query-client/`) so prefetched data is available when client screens SSR. Use `formatUseQuery` view-state flags in screens — not raw `isPending && !data`.

**SEO (indexable routes):** await prefetch in the async `page.tsx` — no `loading.tsx`, no `<Suspense fallback>` around prefetch. Loading states live in client screens (`isPending` / `isFetching`, inline skeletons). `loading.tsx` / Suspense fallbacks are for **non-indexed** routes only (cart, checkout, …). See [code-style-guide.md — Loading UI vs SEO](./code-style-guide.md#loading-ui-vs-seo-indexable-routes).

---

## 5. URL search params (nuqs)

**Purpose:** domain search params are the **single source of truth** for shareable catalog state (filters, sort, pagination). They sync to the URL, drive TanStack Query keys, and survive refresh/bookmark — without duplicating parallel filter types in `api/`.

**Location:** `screens/[feature]/search-params/`

```text
search-params/
  parsers.ts   # catalogSearchParamsParsers, catalogSearchParamsCache, CatalogSearchParams
  types.ts     # CatalogFilterParams, DEFAULT_CATALOG_FILTER_PARAMS, catalogSearchParamsKey()
  hooks.ts     # useCatalogSearchParams() — resetFilters, applyFilters, appliedKey
  index.ts     # barrel — import from @/screens/catalog/search-params
```

### parsers.ts (server-safe)

```ts
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString, parseAsBoolean } from 'nuqs/server';

export const catalogSearchParamsParsers = {
  category: parseAsArrayOf(parseAsString).withDefault([]),
  country: parseAsArrayOf(parseAsString).withDefault([]),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  sort: sortParser,
  isTriedByUs: parseAsBoolean,
  inStock: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(24),
};

export const catalogSearchParamsCache = createSearchParamsCache(catalogSearchParamsParsers);
export type CatalogSearchParams = Awaited<ReturnType<typeof catalogSearchParamsCache.parse>>;
```

### hooks.ts (client)

```ts
'use client';

import { useQueryStates } from 'nuqs';

export function useCatalogSearchParams() {
  // Default shallow: true — client-only URL updates; TanStack Query refetches data.
  // Do NOT use shallow: false unless Server Components must re-run on every param change.
  const [params, setParams] = useQueryStates(catalogSearchParamsParsers);
  // resetFilters, applyFilters, appliedKey …
  return { params, setParams, resetFilters, applyFilters, appliedKey };
}
```

### Data flow

1. **Initial visit / hard refresh:** `page.tsx` parses URL → prefetches RQ → hydrates client
2. **Filter apply / pagination:** `useCatalogSearchParams` updates URL (shallow) → `params` change → `useProductsList(params)` / `useProductFacets(draft)` refetch with loading states
3. **API mapping:** only in `api/products/utils.ts` (`searchParamsToListQuery`, `searchParamsToFacetsQuery`) — fetchers accept `CatalogSearchParams` / `CatalogFilterParams` + `locale`

Global `placeholderData: keepPreviousData` in `shared/query-client/` keeps list/facet grids stable while refetching; opt out on slug-based detail queries (product, collection) where stale data would show the wrong entity.

---

## 6. i18n (next-intl)

**One namespace per screen or domain** — `home`, `catalog`, `checkout`, `products`, `orders`, … Keys stay short inside the namespace (`title`, `fields.phone`).

Shared copy (buttons, errors, metadata) lives in **`common`** or **`metadata`** namespaces in `apps/web/messages/{locale}.json`:

```json
{
  "common": { "loading": "…", "retry": "…" },
  "metadata": { "title": "…", "description": "…" },
  "home": { "title": "…" },
  "catalog": { "title": "…", "filters": { "reset": "…" } }
}
```

```tsx
const t = useTranslations('catalog');
<Typography>{t('title')}</Typography>
<Button>{t('showResults', { count: total })}</Button>
```

- **`useTranslations('namespace')`** in client components; **`getTranslations`** in Server Components / metadata
- **`Trans`** only when a sentence embeds a React node (link, styled span) — otherwise `t('key', { var })`
- Nested keys use camelCase segments: `filters.reset`, `fields.phone`

---

## 7. Client state (Zustand)

Use Zustand when state is **client-only**, **not in the URL**, and **not server data**.

| Need | Use |
| --- | --- |
| API responses, cache, refetch | TanStack Query |
| Filters, sort, pagination the user may share or bookmark | nuqs |
| Local to one component subtree | `useState` |
| Cross-route client state (cart, drawer, session UI prefs) | Zustand |

**Conventions:**

- Store in `hooks/[feature]/` — **`*-store.ts`** (internal) + **`use-*.ts`** (public hooks) + **`index.ts`** barrel
- **`persist` + `partialize`:** only customer-facing continuity (cart lines). Ephemeral UI (`panelOpen`, suppression flags) stays in memory
- **`version` + `migrate`:** bump on shape changes; migrate returns clean state
- **Actions on the store;** screens use thin hooks (`useCartActions`) — not raw `useCartStore`
- Do not duplicate server entities — store IDs, quantities, UI fields; RQ owns product details

Reference: `hooks/cart/` (persisted items + ephemeral panel state).

```ts
// hooks/cart/index.ts — public barrel
export type { CartLine } from './cart-store';
export { useCartActions, useCartItemCount, useCartItems, useCartTotalMinor } from './use-cart';
```

```tsx
import { useCartActions } from '@/hooks/cart';
```

---

## 8. Feature-scoped React Context

When the same client state must reach **several siblings or nested components** within one screen — and passing props through intermediate layers adds noise without clarity — use a **feature-scoped context**: a **Provider wrapper** near the screen root and a **dedicated access hook** for consumers.

**Do not reach for context by default.** Prefer props for one or two levels. Use the right tool first:

| Need | Use |
| --- | --- |
| Shareable filters, sort, pagination | nuqs ([§5](#5-url-search-params-nuqs)) |
| Server data, cache, refetch | TanStack Query ([§3](#3-react-query-hooks)) |
| Cross-route client state (cart, global drawers) | Zustand ([§7](#7-client-state-zustand)) |
| Local to one component | `useState` |
| Shared UI state within one screen subtree (deep prop drilling) | React Context + hook |

**When to add context:** you notice the same props (`viewMode`, `setViewMode`, `menuOpen`, …) threaded through a toolbar → grid → menu chain, or multiple distant components need the same handlers/state and intermediate components only forward them.

### File layout

Colocate with the screen feature — not a global `contexts/` dump:

```text
screens/catalog/view-mode/
├── catalog-view-mode-context.tsx   # Provider + useViewMode()
└── index.ts                        # barrel
```

### Provider + access hook

- **`createContext<T | null>(null)`** — nullable default so the hook can guard misuse
- **Provider** owns state, derives memoized `value`, wraps the screen subtree in `screens/[feature]/index.tsx`
- **Access hook** (`useViewMode`, `useCatalogFiltersUi`, …) calls `useContext`, **throws** if used outside the provider
- Export a typed **`ContextValue`** interface — consumers destructure from the hook, not raw context

```tsx
'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type CatalogViewModeContextValue = {
  viewMode: CatalogViewMode;
  isInfiniteScroll: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setViewMode: (mode: CatalogViewMode) => void;
};

const CatalogViewModeContext = createContext<CatalogViewModeContextValue | null>(null);

type CatalogViewModeProviderProps = {
  initialViewMode: CatalogViewMode;
  children: ReactNode;
};

export function CatalogViewModeProvider({ initialViewMode, children }: CatalogViewModeProviderProps) {
  const [viewMode, setViewModeState] = useState(initialViewMode);
  const [menuOpen, setMenuOpen] = useState(false);

  const setViewMode = useCallback((next: CatalogViewMode) => {
    setViewModeState(next);
    setMenuOpen(false);
  }, []);

  const value = useMemo(
    (): CatalogViewModeContextValue => ({
      viewMode,
      isInfiniteScroll: viewMode === 'infinite',
      menuOpen,
      setMenuOpen,
      setViewMode,
    }),
    [viewMode, menuOpen, setViewMode],
  );

  return <CatalogViewModeContext.Provider value={value}>{children}</CatalogViewModeContext.Provider>;
}

export function useViewMode(): CatalogViewModeContextValue {
  const context = useContext(CatalogViewModeContext);

  if (context == null) {
    throw new Error('useViewMode must be used within CatalogViewModeProvider');
  }

  return context;
}
```

```tsx
// screens/catalog/index.tsx — wrap once at the screen root
export function CatalogScreen({ initialViewMode }: CatalogScreenProps) {
  return (
    <CatalogViewModeProvider initialViewMode={initialViewMode}>
      {/* toolbar, grid, menus — no viewMode props drilled through */}
    </CatalogViewModeProvider>
  );
}
```

```tsx
// components/catalog/catalog-view-mode-menu.tsx — consumer
const { viewMode, setViewMode, menuOpen, setMenuOpen } = useViewMode();
```

**Rules:**

- **One context per cohesive concern** — view mode, filter sheet open state, wizard step; not a grab-bag “catalog context”
- **Keep providers shallow** — wrap the smallest subtree that needs the value (usually the screen), not `app/layout.tsx`
- **Memoize `value`** with `useMemo`; stabilize callbacks with `useCallback` when they sit in the dependency array
- **Do not put server/query data in context** — components that need API data call `useProductsList` / `useProductFacets` directly; context is for client UI coordination only
- **Reference:** `screens/catalog/view-mode/catalog-view-mode-context.tsx` (`CatalogViewModeProvider`, `useViewMode`)

---

## 9. New presentational component

```text
components/catalog/product-card/
├── product-card.tsx
├── product-card.test.tsx
└── index.ts
```

```tsx
export type ProductCardProps = {
  product: ProductSummaryDto;
  onAddToCart?: () => void;
} & StackProps;

export function ProductCard({ product, onAddToCart, ...stackProps }: ProductCardProps) {
  const skinVars = resolveSkin({
    brand: product.brand?.slug,
    country: product.country.code,
    slug: product.slug,
  });

  return (
    <Stack {...stackProps} style={skinVars}>
      {/* image, title, price, CTA */}
    </Stack>
  );
}
```

Test: renders, callback wiring, missing image fallback.

---

## 10. Custom hook

**Location:** `hooks/use-*.ts` (+ test)

```ts
export function useProductSkin(product: ProductSummaryDto | undefined) {
  return useMemo(
    () =>
      product
        ? resolveSkin({
            brand: product.brand?.slug,
            country: product.country.code,
            category: product.category.slug,
            slug: product.slug,
          })
        : undefined,
    [product],
  );
}
```

Keep hooks focused; data fetching belongs in `api/`, not generic hooks.

---

## 11. External URLs

Off-origin links (Telegram, help center, hosted policies, payment portals) live in **`shared/urls.ts`**. Do not hardcode `https://…` in screens or components.

| Kind | Where |
| --- | --- |
| External / third-party | `shared/urls.ts` (`TELEGRAM_SUPPORT_URL`, …) |
| In-app routes | `@/i18n/navigation` — `Link`, `href="/catalog"` |
| Canonical / hreflang / sitemap paths | `shared/seo/urls.ts` — `localePath`, `absoluteUrl`, … |
| API / site origins from env | `shared/env.ts` — `API_URL`, `SITE_URL`, … |

```ts
// shared/urls.ts
export const TELEGRAM_SUPPORT_URL = 'https://t.me/my_noodles';
```

```tsx
import { TELEGRAM_SUPPORT_URL } from '@/shared/urls';

<Button component="a" href={TELEGRAM_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
  {t('telegramCta', { handle: t('telegramHandle') })}
</Button>
```

Use descriptive export names (`TELEGRAM_SUPPORT_URL`, `PRIVACY_POLICY_URL`) and blank lines between unrelated groups — not section comments.

---

## 12. Testing

### Unit (Vitest, no DOM)

Stores, formatters, pure utils — co-located `~*.test.ts` or `*.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from './cart-store';

describe('useCartStore', () => {
  beforeEach(() => useCartStore.setState({ items: [] }));

  it('merges lines by productId', () => {
    // assert state — no render, no selectors
  });
});
```

### Component (Vitest + Testing Library)

Prefer accessible queries; mock `next-intl` when needed:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('submits checkout when form is valid', async () => {
  render(<CheckoutForm />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
});
```

Use **`shared/test-ids.ts`** only when multiple identical controls share the same role+name.

### E2E (Playwright)

Smoke tests live in `apps/web/e2e/`. Import i18n from fixtures — never inline Ukrainian/English copy:

```ts
import { testIds } from '../src/shared/test-ids';

import { e2eLocale, uk } from './fixtures/uk-messages';

await page.goto(`/${e2eLocale}/catalog`);
await page.getByTestId(testIds.catalog.addToCart('pocky-matcha')).click();
await page.getByRole('link', { name: uk.cart.checkout }).click();
await page.getByLabel(uk.checkout.fields.name).fill('Andrii');
await page.getByTestId(testIds.checkout.submit).click();
await expect(page).toHaveURL(new RegExp(`\\/${e2eLocale}\\/checkout\\/success$`));
```

**Mock API for e2e:** `e2e/mock-api.mjs` — Playwright `webServer` starts it before Next dev (see `playwright.config.ts`).

### Running tests

```bash
pnpm nx run web:test          # Vitest unit/component
pnpm nx run web:e2e           # Playwright funnel
pnpm nx run web:validate           # format + lint + type-check + Vitest + knip
```

Pre-push runs `nx affected -t knip`; CI runs staged quality → unit → e2e (`.github/workflows/ci.yml`).
