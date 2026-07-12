# Frontend Code Style Guide

---

## Table of Contents

- [TypeScript Standards](#typescript-standards)
- [Comments](#comments)
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [Performance](#performance)
- [Design & Theme](#design--theme)
- [File Organization](#file-organization)
- [Testing](#testing)
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

- Non-obvious **business rules** that are easy to misread (e.g. consent edge case, “why not the obvious fix”)
- A **warning** for future maintainers (ordering constraint, intentional deviation from a library default)

**Avoid:**

- Restating what the code already says (`// increment counter`)
- Commented-out placeholders for future work — add the export when needed
- Architecture essays in source files — that belongs in `docs/` or skill references, not next to every module

---

## Component Patterns

- Functional components + hooks
- Pass-through `...props` to root when building reusable pieces
- Composition over deep prop drilling — context only when already established in the feature

---

## State Management

### Server data → TanStack Query

- Hooks in `apps/web/src/api/[feature]/`
- Hierarchical **query-key factories** in `[feature].ts` (e.g. `productsQueryKeys`)
- **Mutation-key factories** in the same file when a mutation needs a stable `mutationKey` (e.g. concurrent adds + `useMutationState`, cross-component pending UI) — e.g. `cartMutationKeys.addItem()`. Do not scatter magic strings; omit `mutationKey` when the default anonymous mutation is enough.
- Server Components: prefetch with the same keys → `HydrationBoundary`

### Mutations → prefer `mutate`

Follow TanStack Query mutations guidance: use **`mutate`** for almost all writes. Put **shared** cache invalidation and analytics in the hook’s `useMutation({ onSuccess })`. Pass **per-call** `onSuccess` / `onError` only for **single in-flight** writes (one click at a time).

```tsx
// ✅ fire-and-forget write + local feedback (one add at a time)
addCartItem(payload, {
  onSuccess: () => showToast.success(t('addedToCart', { name: payload.title })),
  onError: () => showToast.error(t('addFailed')),
});

// ✅ optimistic UI + rollback on failure
setItemLiked(productId, true);
likeFeed(productId, { onError: () => setItemLiked(productId, false) });
```

**Two callback layers — they behave differently:**

| Callback                      | Runs when                                           | Concurrent `mutate()` calls                                                                                                                                              |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useMutation({ onSuccess })`  | Every successful mutation                           | ✅ Runs once for **each** successful mutation. You can inspect `variables` to know which request completed.                                                               |
| `mutate(vars, { onSuccess })` | The callback attached to a specific `mutate()` call | ⚠️ If multiple `mutate()` calls overlap on the **same mutation instance**, only the **latest** per-call callbacks are guaranteed to fire. Earlier ones are unsubscribed. |

Every call to `mutate()` creates a new mutation observer. When you call `mutate()` again on the same mutation object before the previous one finishes, React Query removes the previous observer and attaches the new one. The hook-level callbacks belong to the mutation itself, so they execute for every mutation result. The per-call callbacks belong to the observer, so replacing the observer means earlier callbacks are discarded.

### If you need every callback

There are three common approaches:

* Put the logic in `useMutation({ onSuccess })` (recommended for shared behavior).
* Use `mutateAsync()` and `await` each call:

  ```tsx
  await mutation.mutateAsync(item1);
  await mutation.mutateAsync(item2);
  ```
* Create separate mutation instances if each operation needs its own independent lifecycle.

### Mutations → invalidate, don’t manually patch cache

After a mutation, **prefer `queryClient.invalidateQueries({ queryKey })`** so every subscriber refetches through its own `queryFn`. That keeps a single source of truth for response shape and avoids drift when DTOs or hooks change.

**Await invalidation in `onSuccess` / `onError`.** TanStack Query accepts async lifecycle callbacks — while they run, the mutation stays **`pending`**, so spinners on the triggering control stay visible until refetch settles and dependent UI can read fresh data.

```tsx
// ✅ default — await so isPending covers mutation + refetch
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
},

// ✅ multiple keys — await all refetches before mutation settles
onSuccess: async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() }),
    queryClient.invalidateQueries({ queryKey: ordersQueryKeys.checkout(orderId) }),
  ]);
},

// ✅ mutation response still available for side effects after cache is fresh
onSuccess: async (cart, variables) => {
  await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
  openPanelIfFirstAdd(cart.itemCount === variables.qty);
},
```

```tsx
// ❌ fire-and-forget — mutation settles before refetch; spinner clears too early
onSuccess: () => {
  void queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
},
```

**`setQueryData`** — rare exceptions only:

- Optimistic updates with explicit rollback in `onError`
- Internal cache orchestration
- Updating a query **you do not own** and cannot invalidate (external / third-party hook) — document why

Do **not** mirror mutation responses into cache with `setQueryData` when invalidation would work — it duplicates shape knowledge and becomes hard to maintain.

### URL state → nuqs

Domain **search params are the source of truth** for shareable filter/sort/pagination state. Layout per feature:

```text
screens/[feature]/search-params/
  parsers.ts   # nuqs parsers + createSearchParamsCache (server-safe)
  types.ts     # CatalogSearchParams, CatalogFilterParams, defaults, appliedKey helpers
  hooks.ts     # useCatalogSearchParams() — wraps useQueryStates + reset/apply helpers
  index.ts     # public barrel
```

- **Server:** `catalogSearchParamsCache.parse(searchParams)` for initial prefetch only
- **Client:** `useCatalogSearchParams()` for client side query params usage
- **No mappers in search-params/** — map to API query shape inside `api/[feature]/` fetchers right before sending to api, operate with domain structure across application - to api expecting shape before send

```ts
export function useCatalogSearchParams() {
  const [params, setParams] = useQueryStates(catalogSearchParamsParsers);
}
```

### Compound component client-side logic/flow → Zustand

If the logic is more then CRUD that react-query hooks is enough for, abstract the functionality behind hooks/components with usage of Zustand store

- Stores live in `hooks/[feature]/` — **`cart-store.ts`** (Zustand instance, internal) + **`use-*.ts`** (selector/action hooks) + **`index.ts`** barrel. Screens import `@/hooks/cart`, never the raw store.
- **Persist only what the customer expects across sessions** (`persist` + `partialize`). Ephemeral UI (`panelOpen`, suppression flags, draft toggles) stays in memory — not localStorage.
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
if (isPending) return <Skeleton />;
if (isError) return <ErrorState onRetry={refetch} />;
if (!items.length) return <EmptyState />;
return <Content isRefetching={isFetching && !isPending} />;
```

---

## Performance

- ISR/`revalidate` for catalog and product pages per mvp-plan
- RQ caching — don't refetch on every render
- Optimize only when measured — no premature `memo` everywhere

---

## Design & Theme

- **`packages/theme`** — bare tokens and MUI component defaults (`theme.colors.*`, spacing, typography)
- **`packages/ui`** — composed components, icons
- Extend look-and-feel in **`packages/theme/src/components.ts`** (MUI `styleOverrides` / `variants`) so apps reuse defaults instead of repeating `sx`
- Cyrillic fonts: **Unbounded** (display), **Manrope** (body) via `packages/theme/fonts.css`
- Extract generic composed UI to **`packages/ui`** when reusable across frontend apps (`StableLinearProgress`, `DiscoveryCard`, …)
- **Immersive / feature chrome:** when a surface needs colors that are not part of the global theme (e.g. white copy on a full-bleed video reel), prefer MUI palette keys (`common.white`, `alpha(theme.palette.common.black, …)`) and feature-scoped constants in a local `*-chrome.ts`. Raw hex/rgba in `sx` is a **last resort** for effects the theme cannot express (e.g. a one-off like accent on dark media).

---

## File Organization

```text
apps/web/src/
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
- **`shared/env.ts`** — **single source of truth** for all storefront env vars: one Zod schema, parsed once, exported as typed **`env`**. No separate `process.env` reads or env helper files elsewhere. Copy `apps/web/.env.example` → `.env.local`. **Zod-first:** use schema validation, `.transform()`, and `.pipe()` for coercion and normalization; custom parse helpers only as a last resort.
- **`shared/urls.ts`** — external off-origin links (`TELEGRAM_SUPPORT_URL`, …). In-app routes → `@/i18n/navigation`; SEO path builders → `shared/seo/urls`.

### Module barrels

Each **`[layer]/[feature]/`** folder is a **module**. The **`index.ts`** is the only public surface — it re-exports what other layers may use (hooks, fetchers, components, etc). Implementation files stay internal.

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

---

## Testing

Three layers — pick the lightest tool that proves the behavior:

| Layer | Tool | DOM? | Selector strategy |
| --- | --- | --- | --- |
| **Unit** | Vitest | No | Pure functions, Zustand stores, formatters — no selectors |
| **Component / integration** | Vitest + Testing Library | Yes | **`getByRole` → `getByLabel` → `getByText`** (non-i18n data only) |
| **E2E smoke** | Playwright (`apps/web/e2e/`) | Yes | Roles/labels + **i18n fixtures** + URL/state; **`data-testid` sparingly** |

Only valuable use cases that provide value to business should be covered by tests, which overhead with test files and supporting tests will worth the hustle.
Simple utility functions that will be anyway be tested under some test case should not have saperate test file to not pollute codebase with overgranuality and overwhelming file structure.

Write tests only for business valuable flows and functionality, that app will be suffering if that crucial part of application wont be working properly (if you are in doubt - before writing tests ask for clarification of your assumption of importance)

No need for each simple function and change to immediately create a test file with pile of test cases covering simple functionality. Make under test a complete group of business valuable part of application, which correct functioning is priority and thus time spent on writing and covering it by tests will give a benefit in a stability:
business value of functionality stability > time spent on covering it by tests + complication of codebase due to more code

### Selector priority (component + e2e)

1. **`getByRole`** + accessible name — buttons, links, headings, dialogs
2. **`getByTestId`** — only when role/label is ambiguous (e.g. repeated catalog cards) or the action must stay stable across copy changes
3. **`getByLabel`** — form fields (checkout, filters)
4. **URL / store / API state** — `/checkout/success`, cart count, mocked responses
5. **Avoid** hardcoded UI copy in specs and **`getByText` for primary actions**

### `data-testid` policy

- Name by **action + domain**, not visual copy: `catalog-add-to-cart--{slug}`, `checkout-submit`
- Add a testId only when role/label cannot uniquely target the element; never on typography or static headings


Use test-ids hardcoded as magic strings in component.This is fine those will be a guardrail to keep components in tact with tests. No need to keep test ids in separate variables file. It will just additional file to reference and overcomplicate imports in files.

A good default is:

Prefer getByRole, getByLabelText, getByText, etc. Use data-testid only when needed.
When you do use data-testid, inline the string in both the component and the test. Treat the test ID as part of the component's public testing contract rather than an implementation detail.

For most applications, duplicated test ID strings are a reasonable trade-off because they make tests more effective at detecting unintended changes.


### File layout

```text
hooks/cart/cart-store.test.ts          # unit — co-located, ~ prefix optional
components/checkout/checkout-form.test.tsx
e2e/funnel.spec.ts                      # Playwright smoke
```
---

## Anti-Patterns

Grounded in how `apps/web` is actually structured. When in doubt, grep the nearest feature and copy its shape.

| Avoid | Prefer |
| --- | --- |
| Raw generated SDK calls / `fetch` inside screens or components | Server-safe fetchers + query keys in `api/[feature]/[feature].ts`; client hooks in `*.hooks.ts` |
| Deep imports into module internals (`@/api/orders/orders.hooks`, `@/hooks/cart/use-cart`) | Module barrel only: `@/api/orders`, `@/hooks/cart` (see [Module barrels](#module-barrels-same-idea-as-backend-domains)) |
| `useState` for catalog filters, sort, or pagination | nuqs in `screens/[feature]/search-params/`; `useCatalogSearchParams()` in client UI |
| Mappers from search params in `screens/` | Map in `api/[feature]/utils.ts` inside fetchers; fetchers accept search-params/query-params structure directly |
| User-visible strings in JSX | Define keys in translation framework to their values, so no magic strings would be present in codebase |
| Hardcoded external `https://…` in screens/components | Named exports in `shared/urls.ts` (`TELEGRAM_SUPPORT_URL`, …) |
| Long `sx={{ … }}` chains copying colors, radii, or spacing | Theme tokens + MUI variants in `packages/theme`; feature chrome files for immersive UIs; raw hex only as last resort (see [Design & Theme](#design--theme)) |
| Query/mutation keys missing query/mutation inputs | Hierarchical key factories (`products(Query|Mutation)Keys.[action](...argrs)`) matching prefetch and hook |
| `setQueryData` in mutation `onSuccess` to mirror API responses | `invalidateQueries` with the smallest relevant key set; use mutation `data` only for side effects (see [Mutations → invalidate](#mutations--invalidate-dont-manually-patch-cache)) |
| `void invalidateQueries(...)` in mutation lifecycle callbacks | `async onSuccess` / `onError` + `await invalidateQueries(...)` so `isPending` covers refetch (see [Mutations → invalidate](#mutations--invalidate-dont-manually-patch-cache)) |
| Skipping loading, error, or empty UI | Full lifecycle: skeleton → error + retry → empty → data (see [UI states](#ui-states-always-handle)) |
| `mutateAsync` for fire-and-forget writes or `.then()` shims | `mutate` for single-flight callbacks; `mutateAsync` when you need a Promise per call (concurrent toasts, multi-step flows) (see [Mutations → prefer `mutate`](#mutations--prefer-mutate)) |
| Global fixed loading indicator for route-local refetch | Contextual feedback near updating content (toolbar + grid veil, filter panel dim) |
| `data-testid` on every element | Roles/labels first; test ids for ambiguous actions |
