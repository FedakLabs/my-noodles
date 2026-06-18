# Frontend Code Style Guide (my-noodles)

Conventions for `apps/web`. When unsure, grep the nearest analogous module. Architecture: `docs/mvp-plan.md`.

---

## Table of Contents

- [TypeScript Standards](#typescript-standards)
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
- Use `exactOptionalPropertyTypes`-safe optional props (omit vs `undefined` deliberately)

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

- Parser schema in `screens/[feature]/search-params/`
- Server: `createSearchParamsCache` in `page.tsx`
- Client: `useQueryStates(…, { shallow: false })` for filter controls

### Client-only → Zustand

- Cart store with `persist` + `version`/`migrate` (drops stale cart on bump)
- No server persistence until checkout submit

### UI states (always handle)

```tsx
if (isLoading) return <Skeleton … />;
if (isError) return <Alert severity="error">{…}</Alert>;
if (!items.length) return <EmptyState … />;
return <ProductGrid items={items} />;
```

---

## Performance

- ISR/`revalidate` for catalog and product pages per mvp-plan
- RQ caching — don't refetch on every render
- `next/image` for product photos (remote URLs from API)
- View Transitions / `motion` as progressive enhancement
- Optimize only when measured — no premature `memo` everywhere

---

## Design & Theme

- **`packages/theme`** is the source of truth — not Figma px overrides
- Use semantic tokens (`theme.colors.text.*`, `theme.colors.surface.*`, spacing scales)
- Cyrillic fonts: **Unbounded** (display), **Manrope** (body) via `next/font`
- Skins: CSS variables from `resolveSkin()` on product/collection surfaces
- **`formatCurrency`**: integer minor units only — see mvp-plan contract

When Figma differs slightly from theme: implement with theme values, note mismatches, wait for user decision before changing tokens.

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
│   └── search-params/
├── components/[feature]/
├── api/[feature]/
│   ├── [feature].ts        # hooks + query keys
│   ├── types.ts
│   └── index.ts
├── hooks/                  # cart, useSkin, useAnalytics, …
├── utils/
└── shared/
```

**Rules:**
- Layer by technical concern, group by feature inside each folder
- Co-locate `*.test.tsx` with source
- i18n messages in per-locale JSON (path per next-intl setup — verify in repo)
- **`packages/api-clients`** = axios client only; **`apps/web/src/api`** = React Query layer

---

## Anti-Patterns

| Don't | Do |
| --- | --- |
| Import `@merchant-portal/*` or assume `packages/ui` exists | Use `packages/theme` + local `components/` |
| TanStack Router / `pages/` SPA routing | Next App Router + `screens/` |
| `public/locales/…` without checking repo | Follow next-intl message file layout in repo |
| Raw axios in components | `apps/web/src/api` hooks |
| Magic strings in JSX | `useTranslations` |
| Skip empty/error/loading | Handle all four states |
| Deep `sx` overrides on every element | Theme tokens + MUI variants |
| Cart persisted to server before checkout | Zustand until `POST /orders` |

---

## Quick checklist

- [ ] Correct layer (`app` / `screen` / `component` / `api` / `hook`)
- [ ] i18n for user-visible text
- [ ] RQ keys include all filter/pagination inputs
- [ ] Client boundary justified
- [ ] Theme tokens, not raw hex
- [ ] Tests co-located
- [ ] `pnpm nx run web:quality-check` passes
