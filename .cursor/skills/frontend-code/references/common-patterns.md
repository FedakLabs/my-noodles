# Frontend Code Common Patterns

---

## Table of Contents

1. [Layout](#1-layout)
2. [Forms (react-hook-form + Zod)](#2-forms-react-hook-form--zod)
3. [React Query hooks](#3-react-query-hooks)
4. [Route + screen (Next.js App Router)](#4-route--screen-nextjs-app-router)
5. [URL filters (nuqs)](#5-url-filters-nuqs)
6. [i18n](#6-i18n)
7. [Client state (Zustand)](#7-client-state-zustand)
8. [Feature-scoped React Context](#8-feature-scoped-react-context)
9. [Custom hook](#9-custom-hook)
10. [External URLs](#10-external-urls)
11. [Testing](#11-testing)

---

## 1. Layout

### Progressive disclosure (smooth layout shifts)

When part of the UI can grow or shrink by a **large amount** — filter “show all”, long product descriptions, expandable detail blocks — **do not mount/unmount the extra content instantly**. A sudden height jump feels jarring and makes the page hard to follow.

**Default:** wrap the revealed block in MUI **`Collapse`**. Keep the stable summary (first N items, teaser copy, toggle control) outside; animate only the delta.

```tsx
'use client';

import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';

export function ExpandableBlock({
  expanded,
  teaser,
  rest,
}: {
  expanded: boolean;
  teaser: React.ReactNode;
  rest: React.ReactNode;
}) {
  return (
    <Stack spacing={1}>
      {teaser}
      <Collapse in={expanded} sx={{ width: '100%' }}>
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
- **Keep toggles outside** the collapsing region so “Show all / Show less” stays reachable while height animates
- **Pinned selections when collapsed** — if collapsed UI must still show active choices (e.g. selected filters beyond the first N), render them outside the collapse; put only the hidden remainder inside `Collapse`
- **`unmountOnExit`** — only when removed content is decorative and remount cost is low (load-more waiting line);
- **Not for loading** — skeletons, progress bars, and refetch veils use [Initial load vs refetch](#initial-load-vs-refetch) patterns instead

---

## 2. Forms (react-hook-form + Zod)

Define a **Zod schema that matches the mutation input** — no separate mapper layer unless merging unrelated sources (e.g. cart lines + form fields into one DTO).

**Zod-first (forms, env, and any input boundary):** prefer schema validation, `.transform()`, and `.pipe()` for coercion and derived shapes. Custom parse helpers are a fallback when Zod cannot express the rule cleanly — not the default.

### File layout

```text
components/checkout/
├── validation.ts          # zod schema + inferred types
└── checkout-form.tsx
```

### Schema

```ts
import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  city: z.string().trim().min(1),
  branch: z.string().trim().min(1),
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
    defaultValues: { customerName: '', phone: '', city: '', branch: '' },
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

**Location:** `src/api/[feature]/` — import from **`@/api/[feature]`** (the module `index.ts`), not from `*.hooks.ts` / `*.ts` directly.

- **`[feature].ts`** — query-key factories + optional mutation-key factories + async fetchers (importable from Server Components for prefetch)
- **`[feature].hooks.ts`** — `'use client'` hooks only; wrap results with `formatUseQuery` / `formatUseMutation`

### Types: generated DTOs first

Use generated models from `packages/api-clients/*` in hooks, screens, and components. Since anyway api is already depended on external API it will be request, so creating some middle ground DTOs is an exhaustive overcomplication of use

**Query inputs use domain search-param types** — use nuqs inferent query params types down to API level. No need to duplicate and write some custom transformers domain query-params -> API query params. During call of api this is simply can be done by passing domain object to appropriate places in generated clients

**Custom types / mappers (`utils.ts`) only when there is a critical architectural reason**, e.g.:

- Merging multiple API responses into one UI-specific shape
- Normalizing a third-party API we do not control
- Deliberately hiding fields the UI must never see

Do **not** add `*ViewModel` duplicates of our own DTOs — that creates drift with no benefit.

```ts
// products.ts — server-safe fetchers + query keys (no React hooks)
import { productsControllerList, type PaginatedProductsDto } from '@my-noodles/api-clients/storefront';

import type { CatalogSearchParams } from '@/screens/catalog/search-params';

export const productsQueryKeys = {
  all: ['products'] as const,
  list: (params: CatalogSearchParams, locale: AppLocale) =>
    [...productsQueryKeys.all, 'list', locale, params] as const,
};

export async function fetchProductsList(params: CatalogSearchParams): Promise<PaginatedProductsDto> {
  return productsControllerList({ query: {...map params to query} });
}
```

```ts
// cart.ts — mutation keys only when needed (e.g. useMutationState for concurrent in-flight adds)
export const cartMutationKeys = {
  all: ['cart'] as const,
  addItem: () => ['cart', 'addItem'] as const,
};
```

```ts
// cart.hooks.ts — mutation key + invalidate + concurrent pending tracking
export function useAddCartItem() {
  const mutation = useMutation({
    mutationKey: cartMutationKeys.addItem(),
    mutationFn: ({ productId, qty = 1 }: CartLineInput) => addCartItem({ productId, qty }),
    onSuccess: async (cart, variables) => {
      await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
      openPanelIfFirstAdd(cart.itemCount === variables.qty);
    },
  });

  const addCartItemPendingProductIds = useMutationState({
    filters: { mutationKey: cartMutationKeys.addItem(), status: 'pending' },
    select: (entry) => (entry.state.variables as CartLineInput | undefined)?.productId,
  }).filter((id): id is string => id != null);

  return {
    ...formatUseMutation(mutation, 'addCartItem'),
    addCartItemIsAddingProduct: (productId) => addCartItemPendingProductIds.includes(productId),
  };
}
```

**Hook result naming** — use `formatUseQuery` / `formatUseMutation` from `@my-noodles/web-lib/react-query` so destructuring is prefixed (`products`, `productsIsPending`, `productsIsInitialLoad`, `createOrder`, `createOrderIsPending`, …).

For infinite catalog lists, use `pagePaginatedGetNextPageParam` + `formatUseInfiniteQuery` with our `{ items, meta: { page, limit, total } }` shape.

**Screen recipe** — one branch per outcome, separate i18n keys (`loading`, `error`, `empty`):

```tsx
'use client';

const { product, productIsInitialLoad, productIsLoadFailed, productIsEmpty } = useProductDetail(slug);

if (productIsInitialLoad) {
  return (
    <PageContainer>
      <Typography color="text.secondary">{t('loading')}</Typography>
    </PageContainer>
  );
}

if (productIsLoadFailed) {
  return (
    <PageContainer>
      <Typography color="error">{t('error')}</Typography>
    </PageContainer>
  );
}

if (productIsEmpty) {
  return (
    <PageContainer>
      <Typography color="text.secondary">{t('empty')}</Typography>
    </PageContainer>
  );
}

// product is defined — render the happy path
```

**Do not** conflate error and empty:

- **`error`** — “Couldn’t load …” (network, 5xx, or thrown client). User may retry.
- **`empty`** — “Not found” or legitimately no rows. No retry unless filters can change.

**Lists vs single entity:**

- **Entity screen** (product, collection): `*IsEmpty` for not-found / missing entity
- **List/grid** (catalog): after load, **zero items** is usually domain empty (`products.items.length === 0`) with copy like `catalog.emptyState` — not `*IsEmpty` on the query (the query succeeded with an empty page).

### Initial load vs refetch

Distinguish **first fetch** from **background refetch** — different UX, same query hook. Prefer `*IsInitialLoad` / `*IsRefetching` from `formatUseQuery` over hand-rolling `isPending && !data`.

| Phase | Signal |
| --- | --- | --- |
| **First visit** | `*IsInitialLoad` |
| **Filter/sort/page change** | `*IsRefetching` |

```tsx
const { products, productsIsInitialLoad, productsIsRefetching } = useProductsList(params);

if (productsIsInitialLoad) return <ProductGridSkeleton />;
// … render stale products; bind conditionally to productsIsRefetching in case need for showing some state on refetching
```

---

## 4. Route + screen

Every route: responsible for displaying correct screen, optional prefetch of some queries for further hydration.

**SEO (indexable routes):** await prefetch in the SSR page. Loading states live in client screens (`isPending` / `isFetching`, inline skeletons).

### Loading UI vs SEO (indexable routes)

**SEO-sensitive routes** — home, catalog, product detail, collection landing — must ship **real content in the initial HTML** (product names, links, copy). Crawlers and “View Page Source” should not see route-level skeleton markup.

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

## 5. URL search params (nuqs)

**Purpose:** domain search params are the **single source of truth** for url search params interpretation. They sync to the URL, drive TanStack Query keys, and survive refresh/bookmark

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
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsBoolean,
} from 'nuqs/server';

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
  const [params, setParams] = useQueryStates(catalogSearchParamsParsers);
  return { params, setParams, resetFilters, applyFilters, appliedKey };
}
```

### Data flow

1. **Initial visit / hard refresh:** `page.tsx` parses URL → prefetches RQ → hydrates client
2. **Filter apply / pagination:** `useCatalogSearchParams` updates URL (shallow) → `params` change → `useProductsList(params)` / `useProductFacets(draft)` refetch with loading states
3. **API mapping:** only in `api/products/utils.ts` (`searchParamsToListQuery`, `searchParamsToFacetsQuery`) — fetchers accept `CatalogSearchParams` / `CatalogFilterParams` + `locale`

Global `placeholderData: keepPreviousData` in `shared/query-client/` keeps list/facet grids stable while refetching; opt out on slug-based detail queries (product, collection) where stale data would show the wrong entity.

---

## 6. i18n

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

- Nested keys use camelCase segments: `filters.reset`, `fields.phone`

---

## 7. Client state (Zustand)

Use Zustand when state is **client-only**, **not in the URL**, and **not server data**.

| Need                                                                                                 | Use            |
| ---------------------------------------------------------------------------------------------------- | -------------- |
| API responses, cache, refetch                                                                        | TanStack Query |
| Filters, sort, pagination the user may share or bookmark                                             | nuqs           |
| Local to one component subtree                                                                       | `useState`     |
| Complicated business logic with state and decisions to remember and build upon further functionality | Zustand        |

**Conventions:**

- Store in `hooks/[feature]/` — **`*-store.ts`** (internal) + **`use-*.ts`** (public hooks) + **`index.ts`** barrel
- **`persist` + `partialize`:** only customer-facing continuity. Ephemeral UI (`panelOpen`, suppression flags) stays in memory
- **Actions on the store;** - entity hook i.e `useCartStore` that encapsulates all logic regarding cart would be used to make encapsulated functionality, but exposed handler to fulfill the use cases
- Do not duplicate server entities — store IDs, quantities, UI fields; RQ owns product details

---

## 8. Feature-scoped React Context

When the same client state must reach **several siblings or nested components** within one screen — and passing props through intermediate layers adds noise without clarity — use a **feature-scoped context**: a **Provider wrapper** near the screen root and a **dedicated access hook** for consumers.

**Do not reach for context by default.** Prefer props for one or two levels. Use the right tool first:

| Need                                                           | Use                                         |
| -------------------------------------------------------------- | ------------------------------------------- |
| Shareable filters, sort, pagination                            | nuqs ([§5](#5-url-search-params-nuqs))      |
| Server data, cache, refetch                                    | TanStack Query ([§3](#3-react-query-hooks)) |
| Cross-route client state (cart, global drawers)                | Zustand ([§7](#7-client-state-zustand))     |
| Local to one component                                         | `useState`                                  |
| Shared UI state within one screen subtree (deep prop drilling) | React Context + hook                        |

**When to add context:** you notice the same props (`viewMode`, `setViewMode`, `menuOpen`, …) threaded through a toolbar → grid → menu chain, or multiple distant components need the same handlers/state and intermediate components only forward them.

### File layout

Colocate with the screen feature — not a global `contexts/` dump:

```text
screens/catalog/view-mode/
├── catalog-view-mode.context.tsx   # Provider + useViewMode()
└── index.ts                        # barrel
```

### Provider + access hook

- **`createContext<T | null>(null)`** — nullable default so the hook can guard misuse
- **Provider** owns state, derives memoized `value`, wraps the screen subtree in `screens/[feature]/index.tsx`
- **Access hook** `use[Feature]` calls `useContext`, **throws** if used outside the provider
- Export a typed **`ContextValue`** interface — consumers destructure from the hook, not raw context

```tsx
'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type [Feature]ContextValue = {
  ...
};

const [Feature]Context = createContext<[Feature]ContextValue | null>(null);

type [Feature]ProviderProps = {
  ...props to provider
  children: ReactNode;
};

export function [Feature]Provider({ ..., children }: [Feature]ProviderProps) {
  const value = useMemo(
    (): [Feature]ContextValue => ({
      ...context value
    }),
    [viewMode, menuOpen, setViewMode],
  );

  return <[Feature]Context.Provider value={value}>{children}</[Feature]Context.Provider>;
}

export function use[Feature](): [Feature]ContextValue {
  const context = useContext([Feature]Context);

  if (context == null) {
    throw new Error('use[Feature] must be used within [Feature]Provider');
  }

  return context;
}
```

```tsx
// screens/catalog/index.tsx — wrap once at the screen root
export function Screen(props: ScreenProps) {
  return (
    <[Feature]Provider {...provider props}>
      {/* child components that use the context */}
    </[Feature]Provider>
  );
}
```

---

## 9. Custom hook

**Location:** `hooks/use-*.ts` (+ test)

Keep hooks focused; data fetching belongs in `api/`, not generic hooks.

---

## 10. External URLs

Off-origin links (Telegram, help center, hosted policies, payment portals) live in **`shared/urls.ts`**. Do not hardcode `https://…` in screens or components.

| Kind                                 | Where                                                 |
| ------------------------------------ | ----------------------------------------------------- |
| External / third-party               | `shared/urls.ts` (`TELEGRAM_SUPPORT_URL`, …)          |
| Canonical / hreflang / sitemap paths | `shared/seo/urls.ts` — `localePath`, `absoluteUrl`, … |
| API / site origins from env          | `shared/env.ts` — `API_URL`, `SITE_URL`, …            |

```ts
// shared/urls.ts
export const TELEGRAM_SUPPORT_URL = 'https://t.me/my_noodles';
```

```tsx
import { TELEGRAM_SUPPORT_URL } from '@/shared/urls';

<Button component="a" href={TELEGRAM_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
  {t('telegramCta', { handle: t('telegramHandle') })}
</Button>;
```

Use descriptive export names (`TELEGRAM_SUPPORT_URL`, `PRIVACY_POLICY_URL`)

---

## 11. Testing

### Component (Vitest + Testing Library)

Prefer accessible queries:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('submits checkout when form is valid', async () => {
  render(<CheckoutForm />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
});
```

Use test-ids hardcoded as magic strings in component.This is fine those will be a guardrail to keep components in tact with tests. No need to keep test ids in separate variables file. It will just additional file to reference and overcomplicate imports in files.

A good default is:

Prefer getByRole, getByLabelText, getByText, etc.
Use data-testid only when needed.
When you do use data-testid, inline the string in both the component and the test. Treat the test ID as part of the component's public testing contract rather than an implementation detail.

For most applications, duplicated test ID strings are a reasonable trade-off because they make tests more effective at detecting unintended changes.

### E2E (Playwright)

Smoke tests live in `e2e/`

```ts
import { e2eLocale } from './fixtures';

await page.goto(`/${e2eLocale}/catalog`);
await page.getByTestId('product-card').click();
await page.getByRole('link', { name: uk.cart.checkout }).click();
await page.getByLabel('checkout-field-name').fill('Andrii');
await page.getByTestId('checkout-field-submit').click();
```

**Mock API for e2e:** `e2e/mock-api.ts` + typed fixtures in `e2e/fixtures/*.ts` (bound to external api response types). Playwright `webServer` starts it before Next dev (see `playwright.config.ts`).

### Running tests

```bash
pnpm nx run web:test          # Vitest unit/component
pnpm nx run web:e2e           # Playwright funnel
pnpm nx run web:validate           # format + lint + type-check + Vitest + knip
```

Pre-push runs `nx affected -t knip`; CI runs staged quality → unit → e2e (`.github/workflows/ci.yml`).
