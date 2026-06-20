# Common Patterns — Frontend (my-noodles)

Task recipes for `apps/web`. **Always grep the repo first** — if scaffolding is missing, follow `docs/mvp-plan.md` and keep the diff minimal. Names below (catalog, checkout, products) match this storefront.

> Read [code-style-guide.md](./code-style-guide.md) first.

---

## Table of Contents

1. [Verify before you import](#1-verify-before-you-import)
2. [Theme & layout](#2-theme--layout)
3. [Forms (react-hook-form + Zod)](#3-forms-react-hook-form--zod)
4. [React Query hooks](#4-react-query-hooks)
5. [Route + screen (Next.js App Router)](#5-route--screen-nextjs-app-router)
6. [Catalog filters (nuqs)](#6-catalog-filters-nuqs)
7. [i18n (next-intl)](#7-i18n-next-intl)
8. [Cart (Zustand)](#8-cart-zustand)
9. [New presentational component](#9-new-presentational-component)
10. [Custom hook](#10-custom-hook)

---

## 1. Verify before you import

Do **not** assume primitives from other codebases:

| If you're about to…                                           | Stop and…                                                                                     |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Import from `@merchant-portal/ui` or `@merchant-portal/utils` | This repo doesn't use them                                                                    |
| Use `formatUseQuery` / `formatUseMutation`                    | Defined in `apps/web/src/api/_lib/queries.ts` — use them in all API hooks |
| Add `DetailsModal`, `ConfirmationModal`, `DataTable`          | Not part of this project — use MUI `Dialog`, local table/grid components                      |
| Wire TanStack Router / `routes-config.tsx`                    | Routing is Next.js `app/[locale]/…`                                                           |
| Read `packages/ui` or `packages/themes`                       | Design system is **`packages/theme`**                                                         |

---

## 2. Theme & layout

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

## 3. Forms (react-hook-form + Zod)

**Checkout** is the primary form flow (name, phone, city, branch + honeypot `company`).

### File layout

```text
components/checkout/
├── validation.ts          # zod schema + types + mapToCreateOrderDto
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

  const { createOrder, isPending } = useCreateOrder();

  const onSubmit = form.handleSubmit((data) => {
    if (data.company) return; // honeypot
    createOrder(mapToCreateOrderDto(data, cartItems));
  });

  return <form onSubmit={onSubmit}>{/* Controller + TextField fields; labels via t('fields.name') */}</form>;
}
```

Server-side field errors: map API 400 to `form.setError` when the backend returns structured validation.

---

## 4. React Query hooks

**Location:** `apps/web/src/api/[feature]/`

- **`[feature].ts`** — query-key factories + async fetchers (importable from Server Components for prefetch)
- **`[feature].hooks.ts`** — `'use client'` hooks only; wrap results with `formatUseQuery` / `formatUseMutation`

Uses **`packages/api-clients`** via singleton from `api/clients.ts` (`API_URL` from `shared/env.ts`).

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
- Do **not** inject locale via a global axios interceptor — explicit `locale` on fetchers keeps query keys and SSR predictable; `forbidNonWhitelisted` on the API rejects stray `?locale=` on strict query DTOs

### Env (`shared/env.ts`)

```ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL is not set');
export const API_URL = apiUrl;
```

Copy `apps/web/.env.example` → `.env.local` for local dev. No fallback URLs in source.

---

## 5. Route + screen (Next.js App Router)

Routing lives under **`app/[locale]/`**. Pages are thin wrappers.

```tsx
// app/[locale]/catalog/page.tsx
import { createSearchParamsCache } from 'nuqs/server';
import { CatalogScreen } from '@/screens/catalog';
import { catalogSearchParamsCache } from '@/screens/catalog/search-params';

const searchParamsCache = createSearchParamsCache(catalogSearchParamsCache);

export default async function CatalogPage({ searchParams }: PageProps) {
  const filters = await searchParamsCache.parse(searchParams);
  // prefetch products + facets with filters, wrap in HydrationBoundary
  return <CatalogScreen initialFilters={filters} />;
}
```

```tsx
// screens/catalog/index.tsx
export function CatalogScreen({ initialFilters }: Props) {
  return (
    <>
      <CatalogHeader />
      <FilterSheet />
      <ProductGrid />
    </>
  );
}
```

**Routes (mvp-plan):** home, catalog, collections/[slug], product/[slug], cart, checkout, checkout/success, contacts.

---

## 6. Catalog filters (nuqs)

Single source of truth: **`screens/catalog/search-params/`**

```ts
// catalog.search.ts
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

Drive both `useProductsList(filters)` and `useProductFacets(filtersWithoutPage)`.

---

## 7. i18n (next-intl)

- **`useTranslations('namespace')`** for labels, buttons, errors
- Messages in per-locale JSON (verify path in repo — typically under `messages/` or `src/i18n/`)
- Ukrainian (`uk`) shipped first; structure ready for `en`
- **`Trans`** only when a sentence embeds a React node (link, styled span) — otherwise `t('key', { var })`

```tsx
const t = useTranslations('catalog');
<Typography>{t('title')}</Typography>
<Button>{t('showResults', { count: total })}</Button>
```

Nested keys, camelCase segments: `catalog.filters.reset`, `checkout.fields.phone`.

---

## 8. Cart (Zustand)

Client-only until checkout. Store in `hooks/` (or `hooks/cart/`).

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const CART_VERSION = 1;

type CartState = {
  version: number;
  items: CartLine[];
  addItem: (line: CartLine) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      version: CART_VERSION,
      items: [],
      addItem: (line) => {
        /* merge by productId */
      },
      removeItem: (id) => {
        /* … */
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
      version: CART_VERSION,
      migrate: () => ({ items: [], version: CART_VERSION }), // drop on version bump
    },
  ),
);
```

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
      {/* image, title, price via formatCurrency, CTA */}
    </Stack>
  );
}
```

Test: renders, add-to-cart callback, missing image fallback.

---

## 10. Custom hook

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
