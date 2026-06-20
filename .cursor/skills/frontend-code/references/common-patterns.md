# Common Patterns — Frontend (my-noodles)

Task recipes for `apps/web`. **Grep the repo first** and copy the nearest feature. Read [code-style-guide.md](./code-style-guide.md) first.

---

## Table of Contents

1. [Theme & layout](#1-theme--layout)
2. [Forms (react-hook-form + Zod)](#2-forms-react-hook-form--zod)
3. [React Query hooks](#3-react-query-hooks)
4. [Route + screen (Next.js App Router)](#4-route--screen-nextjs-app-router)
5. [URL filters (nuqs)](#5-url-filters-nuqs)
6. [i18n (next-intl)](#6-i18n-next-intl)
7. [Client state (Zustand)](#7-client-state-zustand)
8. [New presentational component](#8-new-presentational-component)
9. [Custom hook](#9-custom-hook)

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
- Product/collection cards: apply skin CSS variables from `resolveSkin()` at the card root

---

## 2. Forms (react-hook-form + Zod)

Define a **Zod schema that matches the mutation input** — no separate mapper layer unless merging unrelated sources (e.g. cart lines + form fields into one DTO).

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

**Location:** `apps/web/src/api/[feature]/`

- **`[feature].ts`** — query-key factories + async fetchers (importable from Server Components for prefetch)
- **`[feature].hooks.ts`** — `'use client'` hooks only; wrap results with `formatUseQuery` / `formatUseMutation`

Uses **`packages/api-clients`** via singleton from `api/clients.ts` (`API_URL` from `shared/env.ts`, validated with Zod).

### Types: generated DTOs first

We own the storefront API — **`apps/web/src/api` should not mirror response shapes**. Use generated models from `@my-noodles/api-clients/storefront` (`ProductSummaryDto`, `CountryDto`, …) in hooks, screens, and components.

**`types.ts` in each feature folder is for:**

- Re-exporting generated DTOs (barrel for consumers)
- **Query inputs only** — e.g. `ProductListFilters` (locale + URL filters for server prefetch), `ProductListQueryFilters` (URL filters only for client hooks)

**Custom types / mappers (`utils.ts`) only when there is a critical architectural reason**, e.g.:

- Merging multiple API responses into one UI-specific shape
- Normalizing a third-party API we do not control
- Deliberately hiding fields the UI must never see

Do **not** add `*ViewModel` duplicates of our own DTOs — that creates drift with no benefit.

```ts
// products.ts — server-safe fetchers + query keys (no React hooks)
import type { PaginatedProductsDto } from '@my-noodles/api-clients/storefront';

import { getApiClients } from '../clients';
import type { ProductListFilters } from './types';
import { buildProductListRequest } from './utils';

export const productsQueryKeys = {
  all: ['products'] as const,
  list: (filters: ProductListFilters) => [...productsQueryKeys.all, 'list', filters] as const,
};

export async function fetchProductsList(filters: ProductListFilters): Promise<PaginatedProductsDto> {
  const { data } = await getApiClients().productsApi.productsControllerList(
    buildProductListRequest(filters),
  );
  return data;
}
```

```ts
// products.hooks.ts — client hooks resolve locale internally
'use client';

import { useQuery } from '@tanstack/react-query';

import { formatUseQuery } from '../_lib/queries';
import { useAppLocale } from '@/hooks/locale';
import { fetchProductsList, productsQueryKeys } from './products';
import type { ProductListQueryFilters } from './types';

export function useProductsList(filters: ProductListQueryFilters) {
  const locale = useAppLocale();
  const resolvedFilters = { ...filters, locale };

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.list(resolvedFilters),
      queryFn: () => fetchProductsList(resolvedFilters),
    }),
    'products',
  );
}
```

```ts
// orders.hooks.ts
'use client';

import { useMutation } from '@tanstack/react-query';

import { formatUseMutation } from '../_lib/queries';
import { createOrder } from './orders';

export function useCreateOrder() {
  return formatUseMutation(useMutation({ mutationFn: createOrder }), 'createOrder');
}
```

**Hook result naming** — use `formatUseQuery` / `formatUseMutation` from `api/_lib/queries.ts` so destructuring is prefixed (`products`, `productsIsPending`, `createOrder`, `createOrderIsPending`, …). For infinite catalog lists, use `pagePaginatedGetNextPageParam` + `formatUseInfiniteQuery` with our `{ items, meta: { page, limit, total } }` shape.

**Rules:**

- Return `response.data` as-is for our API — no `mapXxx()` unless justified above
- **Client hooks** call `useAppLocale()` (next-intl app locale, same codes as `ApiLocale`) — do not pass `locale` from screens/components
- **Server prefetch / fetchers** take explicit `locale` (from route `params` or `setRequestLocale`) — keep in `*.ts`, not `*.hooks.ts`
- Pass optional `locale` via generated `*Request` types (`{ locale: ApiLocale, … }`), not a separate axios helper
- Use generated sort enums (`ProductsControllerListSortEnum`, `ProductSort`) — do not hand-roll sort constants in `api-clients`
- Facets and list use **separate keys** (facets = filters only; list = filters + page)
- Mutations invalidate the smallest relevant key set
- Server Component prefetch: same `queryKey` + `queryFn` → dehydrate into `HydrationBoundary`
- `utils.ts` = request builders (filters → generated `*Request` types), not response mappers
- Do **not** inject locale via a global axios interceptor — explicit `locale` on fetchers keeps query keys and SSR predictable

---

## 4. Route + screen (Next.js App Router)

**Split:** `app/[locale]/` owns routing, locale guards, metadata, prefetch, and search-param parsing. `screens/[feature]/` owns layout and composition.

```tsx
// app/[locale]/catalog/page.tsx
import { createSearchParamsCache } from 'nuqs/server';
import { CatalogScreen } from '@/screens/catalog';
import { catalogSearchParamsParsers } from '@/screens/catalog/search-params';

const searchParamsCache = createSearchParamsCache(catalogSearchParamsParsers);

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const filters = await searchParamsCache.parse(searchParams);
  // prefetch with productsQueryKeys + dehydrate → HydrationBoundary
  return <CatalogScreen />;
}
```

```tsx
// screens/catalog/index.tsx
export function CatalogScreen() {
  return (
    <>
      <CatalogHeader />
      <FilterSheet />
      <ProductGrid />
    </>
  );
}
```

Every `page.tsx`: validate locale → `setRequestLocale` → optional prefetch → render one screen component.

---

## 5. URL filters (nuqs)

Single source of truth per feature: **`screens/[feature]/search-params/`**

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
  sort: parseAsString.withDefault('popular'),
  isTriedByUs: parseAsBoolean,
  inStock: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(24),
};

export const catalogSearchParamsCache = createSearchParamsCache(catalogSearchParamsParsers);
```

Client controls:

```tsx
'use client';
import { useQueryStates } from 'nuqs';

const [filters, setFilters] = useQueryStates(catalogSearchParamsParsers, { shallow: false });
```

The same parsed values drive TanStack Query keys — e.g. list hook with full filters, facets hook omitting `page` / `limit`.

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

- Store in `hooks/` or `hooks/[feature]/`; screens import `use*Store`, not the raw store
- Do not duplicate server entities — store IDs, quantities, and UI fields; RQ owns product details
- **`persist`** only when continuity across sessions matters; always set `version` + `migrate` so a bump clears stale localStorage

```ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const STORE_VERSION = 1;

type CartState = {
  items: CartLine[];
  addItem: (line: CartLine) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (line) => {
        /* merge by productId */
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSION,
      migrate: () => ({ items: [] }),
    },
  ),
);
```

---

## 8. New presentational component

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

## 9. Custom hook

**Location:** `hooks/use-*.ts` (+ test)

```ts
/**
 * Resolves active skin CSS variables for the current product context.
 */
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

## Running tests

```bash
pnpm nx run web:test
pnpm nx run web:fix
```
