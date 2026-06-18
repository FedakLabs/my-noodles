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

| If you're about to… | Stop and… |
| --- | --- |
| Import from `@merchant-portal/ui` or `@merchant-portal/utils` | This repo doesn't use them |
| Use `formatUseQuery` / `formatUseMutation` | Use standard TanStack Query hooks unless `apps/web/src/api/_lib` defines helpers — grep first |
| Add `DetailsModal`, `ConfirmationModal`, `DataTable` | Not part of this project — use MUI `Dialog`, local table/grid components |
| Wire TanStack Router / `routes-config.tsx` | Routing is Next.js `app/[locale]/…` |
| Read `packages/ui` or `packages/themes` | Design system is **`packages/theme`** |

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

  return (
    <form onSubmit={onSubmit}>
      {/* Controller + TextField fields; labels via t('fields.name') */}
    </form>
  );
}
```

Server-side field errors: map API 400 to `form.setError` when the backend returns structured validation.

---

## 4. React Query hooks

**Location:** `apps/web/src/api/[feature]/[feature].ts`

Uses **`packages/api-clients`** via singleton from `api/clients.ts`.

```ts
import { useQuery } from '@tanstack/react-query';
import { apiClients } from '../clients';

export const productsQueryKeys = {
  all: ['products'] as const,
  list: (filters: ProductListFilters) => [...productsQueryKeys.all, 'list', filters] as const,
  detail: (slug: string, locale: string) =>
    [...productsQueryKeys.all, 'detail', slug, locale] as const,
  facets: (filters: ProductFacetFilters) =>
    [...productsQueryKeys.all, 'facets', filters] as const,
};

export function useProductsList(filters: ProductListFilters) {
  return useQuery({
    queryKey: productsQueryKeys.list(filters),
    queryFn: () =>
      apiClients.productsApi
        .listProducts(/* map filters */)
        .then((res) => res.data),
  });
}
```

**Rules:**
- Facets and list use **separate keys** (facets = filters only; list = filters + page)
- Mutations invalidate the smallest relevant key set
- Server Component prefetch: same `queryKey` + `queryFn` → dehydrate into `HydrationBoundary`

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
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString, parseAsBoolean } from 'nuqs/server';

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
      addItem: (line) => { /* merge by productId */ },
      removeItem: (id) => { /* … */ },
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
  product: ProductViewModel;
  onAddToCart?: () => void;
} & StackProps;

export function ProductCard({ product, onAddToCart, ...stackProps }: ProductCardProps) {
  const skinVars = resolveSkin({ brand: product.brand, country: product.country, slug: product.slug });

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
export function useProductSkin(product: ProductViewModel | undefined) {
  return useMemo(
    () =>
      product
        ? resolveSkin({
            brand: product.brandKey,
            country: product.countryCode,
            category: product.categoryKey,
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
pnpm nx run web:quality-check
```
