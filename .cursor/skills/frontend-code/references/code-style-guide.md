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

Use Zustand for **ephemeral client state** that is not server data and should not live in the URL — e.g. cart lines, drawer open/closed, cross-page UI preferences.

**When to pick something else:**

| Need | Use |
| --- | --- |
| API / cacheable data | TanStack Query (`apps/web/src/api/`) |
| Shareable or bookmarkable filters, sort, pagination | nuqs (`screens/[feature]/search-params/`) |
| Scoped to one subtree | Local `useState` / component state |

**Conventions:**

- Stores live in `hooks/` (or `hooks/[feature]/`); expose a `use*Store` hook, not raw store imports in screens.
- Persist only when the customer expects continuity across sessions (cart). Use `persist` + `version`/`migrate` so a schema bump drops stale localStorage instead of silently breaking.
- Do not mirror server entities in Zustand — RQ owns fetched data; the store holds IDs, quantities, and UI-only fields.

**Cart** (planned) follows this pattern: client-only until checkout submit, then a mutation sends the payload to the API.

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

- **`packages/theme`** is the source of truth — semantic tokens, component defaults, and skins
- Consume tokens via the theme (`theme.colors.*`, spacing scales, `borderRadius`, typography) — not ad-hoc hex, px, or font stacks in feature code
- Extend look-and-feel in **`packages/theme/src/components.ts`** (MUI `styleOverrides` / `variants`) so `apps/web` reuses defaults instead of repeating `sx`
- Cyrillic fonts: **Unbounded** (display), **Manrope** (body) via `@my-noodles/theme/fonts.css`
- Product/collection surfaces: CSS variables from `resolveSkin()` — do not hardcode brand/country accent colors in screens

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
│   ├── [feature].ts        # fetchers + query keys (server-safe, no React)
│   ├── [feature].hooks.ts  # `'use client'` — RQ hooks + formatUseQuery/Mutation
│   ├── types.ts            # re-export generated DTOs + query-input types only
│   ├── utils.ts            # optional: request builders (not response mappers)
│   └── index.ts
├── hooks/                  # useAppLocale, cart, useSkin, …
├── utils/
└── shared/                 # env.ts (API_URL), query-client.ts
```

**Rules:**

- Layer by technical concern, group by feature inside each folder
- Co-locate `*.test.tsx` with source
- i18n messages in per-locale JSON (path per next-intl setup — verify in repo)
- **`packages/api-clients`** = axios client only; **`apps/web/src/api`** = React Query layer
- **`shared/env.ts`** — Zod-validated client env (`API_URL` from `NEXT_PUBLIC_API_URL`); copy `apps/web/.env.example` → `.env.local`
- **`hooks/locale.ts`** — `useAppLocale()` (next-intl); client API hooks merge locale internally, server fetchers take explicit `locale`

---

## Anti-Patterns

Grounded in how `apps/web` is actually structured. When in doubt, grep the nearest feature and copy its shape.

| Avoid | Prefer |
| --- | --- |
| `fetch` / axios / `getApiClients()` inside screens or components | Server-safe fetchers + query keys in `api/[feature]/[feature].ts`; client hooks in `*.hooks.ts` |
| Duplicating OpenAPI shapes as `*ViewModel` / hand-rolled DTOs | Types from `@my-noodles/api-clients/storefront`; local `types.ts` only for query-input/filter shapes |
| `useState` for catalog filters, sort, or pagination | nuqs schema in `screens/[feature]/search-params/`; server cache in `page.tsx`, client `useQueryStates(…, { shallow: false })` |
| Passing `locale` through every screen into hooks | `useAppLocale()` inside `*.hooks.ts`; explicit `locale` only in server prefetch fetchers |
| User-visible strings in JSX | `useTranslations` / `getTranslations`; messages in `apps/web/messages/{locale}.json` |
| `'use client'` on routes, layouts, or presentational wrappers by default | Server Components first; client boundary only for interactivity, RQ, nuqs, Zustand, or browser APIs |
| Business logic and layout mixed in `app/**/page.tsx` | Thin `page.tsx` → `screens/[feature]`; routing shell stays in `app/` |
| Inline defaults for `NEXT_PUBLIC_API_URL` | Zod schema in `shared/env.ts`; values in `.env.local` (see `.env.example`) |
| Long `sx={{ … }}` chains copying colors, radii, or spacing | Theme tokens + MUI variants in `packages/theme`; local `sx` only for one-off layout |
| Query keys missing filter/locale/pagination inputs | Hierarchical key factories (`productsQueryKeys.list(filters)`) matching prefetch and hook |
| Skipping loading, error, or empty UI | Skeleton / Alert / empty state before the happy path |
| Premature `memo` / micro-optimizations | Measure first; ISR + RQ caching cover most cases |

---

## Quick checklist

- [ ] Correct layer (`app` / `screen` / `component` / `api` / `hook`)
- [ ] i18n for user-visible text
- [ ] RQ keys include all filter/pagination inputs
- [ ] Client boundary justified
- [ ] Theme tokens, not raw hex
- [ ] Tests co-located
- [ ] `pnpm nx run web:fix` passes
