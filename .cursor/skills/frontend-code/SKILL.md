---
name: frontend-code
description: 'Primary skill for all frontend code changes — features, bug fixes, refactors, and design implementations. Use whenever the user asks to add, change, fix, or build anything in the UI. Covers Next.js App Router, screens, components, forms, API hooks, cart, i18n, and MUI theming. Consult references/common-patterns.md and references/code-style-guide.md before writing code. Stack: TS strict, React 19, Next.js 16, TanStack Query, MUI v9 (packages/theme + packages/ui), react-hook-form + Zod, next-intl, nuqs, Zustand, Vitest.'
---

# Frontend Implementation (my-noodles storefront)

You are implementing UI for **`apps/web`**: a mobile-first Next.js storefront. Architecture source of truth: `docs/mvp-plan.md` (Frontend + Architecture sections).

**Before writing code:** grep or Glob the repo for the nearest analogous feature. Do **not** assume files, hooks, or components from other projects exist here.

Consult [references/common-patterns.md](./references/common-patterns.md) and [references/code-style-guide.md](./references/code-style-guide.md) before implementing.

## Your Goal

Given a requirement (design, bug, or feature), implement it by:

1. Mapping the change to the correct layer (`app/` route shell → `screens/` → `components/`, plus `api/` hooks or `hooks/` stores)
2. Using **`packages/ui`** components and **`packages/theme`** tokens — no raw hex/px drift
3. Handling loading, error, and empty states
4. Running quality checks — **MUST PASS**

**CRITICAL:** Implementation is NOT complete until:

```bash
pnpm nx run web:fix
```

(format → lint → type-check → Vitest). Use the actual Nx target names once wired.

## Stack & Tools

- **Next.js 16** App Router (`app/[locale]/…`), ISR + Server Components where planned
- **React 19**, **TypeScript** strict
- **TanStack Query v5** — client data; prefetch + `HydrationBoundary` for SSR/ISR
- **MUI v9** + **`packages/ui`** (composed components, skin engine) on top of **`packages/theme`** (tokens, MUI overrides)
- **next-intl** — UI strings; `localePrefix: 'always'` (`/uk/…`)
- **react-hook-form + Zod 4** — forms (checkout, etc.)
- **nuqs** — URL search params (catalog filter state); schema + hook in `screens/[feature]/search-params/`; client updates use default **`shallow: true`** (SPA + TanStack Query refetch)
- **Zustand + persist** — cart (client-only until checkout)
- **packages/api-clients** — **`@hey-api/openapi-ts`** fetch SDK + hand client layer; **`apps/web/src/api`** wraps it with RQ hooks
- **Vitest** + Testing Library — co-located `*.test.tsx`

## Repo layout (`apps/web/src`)

```text
app/           # routing only — thin page.tsx → screens/
screens/       # one folder per page; search-params/ for nuqs URL state
components/    # feature UI (+ *.test.tsx)
api/           # React Query hooks + query-key factories
hooks/         # cart, analytics, skin resolver consumers, …
utils/         # formatCurrency, helpers
shared/        # env.ts (all env vars), urls.ts (external links), ISR, page props, query-client + hydrate
```

**Env:** all `NEXT_PUBLIC_*` (and future client env) live in **`shared/env.ts`** only — one Zod schema, parsed once, named exports (`API_URL`, `SITE_URL`, …). Never parse `process.env` elsewhere. **Zod-first:** use validation, `.transform()`, and `.pipe()` for normalization; ad-hoc parse helpers only when Zod cannot express the rule cleanly (same principle as forms and DTO boundaries).

**External URLs:** off-origin links in **`shared/urls.ts`** — see [common-patterns.md § External URLs](./references/common-patterns.md#10-external-urls). In-app paths use `@/i18n/navigation`; SEO path helpers use `shared/seo/urls`.

**Comments:** sparse in product code — self-explanatory names and structure first; see [code-style-guide.md § Comments](./references/code-style-guide.md#comments).

Providers live in `app/layout.tsx` + `app/providers.tsx` (MUI cache, theme, QueryClient, next-intl, NuqsAdapter).

## Design system (`packages/theme` + `packages/ui`)

- **`packages/theme`** — bare MUI theme: semantic tokens, spacing, typography, component overrides. Storybook for foundations (colors, type, P0 MUI chrome).
- **`packages/ui`** — reusable composed components (`DiscoveryCard`, `PriceRangeSlider`, …), **skin engine** (`resolveSkin()` → CSS variables), per-file SVG icons. Storybook for component catalog (`pnpm nx run ui:storybook`).
- Import **`theme`** from `@my-noodles/theme`; skins and shared components from `@my-noodles/ui`.
- Typography: use `<Typography variant="…">` — avoid overriding `fontSize`/`fontWeight` via `sx`
- **Glob `packages/ui` and `packages/theme`** before adding one-off styling
- Country/brand skins: `resolveSkin()` from `@my-noodles/ui` → CSS variables on card/page root
- Prefer MUI primitives styled via theme — extract generic UI to **`packages/ui`** when it could ship in another frontend app

### When to extract to `packages/ui`

Move a component from `apps/web` when **all** apply:

1. **Reusable** — no hard dependency on catalog API types, cart store, or next-intl (accept copy via props/slots)
2. **Complex enough** — multiple states, responsive behavior, or worth documenting in Storybook
3. **Composes theme** — uses tokens/skins; does not define new visual language (that stays in `theme`)

Keep domain wiring in `apps/web` (thin wrappers that pass i18n labels, API data, and app-specific links). Structure in `packages/ui`:

```text
src/components/[ComponentName]/
src/icons/[name].svg          # import: @my-noodles/ui/icons/cart.svg (SVGR, tree-shakeable)
src/utils/skins/              # skin resolution (enriches theme)
```

Icons — one file per import (bundler tree-shakes unused SVGs). **Size and color via `style`** (strokes use `currentColor`):

```tsx
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import { iconStyle } from '@my-noodles/ui';
import { useTheme } from '@mui/material/styles';

const theme = useTheme();

<CartIcon aria-hidden style={iconStyle({ size: 24, color: theme.colors.icon.primary })} />;
// Inside MUI `color="inherit"` chrome: color: 'inherit'
<MenuIcon aria-hidden style={iconStyle({ size: 24, color: 'inherit' })} />;
```

Do not use `width` / `height` props or parent `color` inheritance for icon sizing/tinting.

SVGR is configured in `apps/web/next.config.ts` (webpack + turbopack) and `packages/ui` Storybook (Vite).

## Implementation Workflow

### Step 0: Analyze

- Which route/screen? Which API hooks or store?
- Server vs client component boundary (filters/cart = client; catalog prefetch = server + RQ hydrate)
- i18n keys needed (per-locale JSON, no magic strings)

### Step 1: Review context

1. Read `references/code-style-guide.md`
2. Grep analogous feature under `screens/`, `components/`, `api/`

### Step 2: Plan files

Example — add catalog sort control:

```text
1. screens/catalog/search-params/parsers.ts — add sort parser
2. screens/catalog/search-params/types.ts — defaults / filter-only type if needed
3. api/products/products.ts — query keys accept CatalogSearchParams; map in fetchers
4. components/catalog/sort-select.tsx — UI control
5. components/catalog/sort-select.test.tsx — tests
6. messages/uk/catalog.json — i18n keys
```

### Step 3: Implement

- Match existing patterns in the touched feature
- User-facing text via **next-intl** (`useTranslations`)
- API calls through **`apps/web/src/api`** hooks, not raw generated SDK calls in components
- Invalidate query keys on mutations

### Step 4: Tests

Co-located Vitest tests: render, interaction, validation, edge cases.

### Step 5: Quality checks

```bash
pnpm nx run web:fix
```

Fix and re-run until green.

When API contract changes, regenerate clients from a running API (`pnpm nx run api:clients:generate`) before `web:type-check`.

### Step 6: Summary

Report check results and files touched only after all checks pass.

## Reference Files

- **`references/code-style-guide.md`** — TypeScript, components, states, file layout, anti-patterns
- **`references/common-patterns.md`** — forms, RQ hooks, routes/screens, nuqs filters, i18n, cart

## Notes

- **Verify in repo first** — patterns in reference files describe _this_ project; if code is not scaffolded yet, follow mvp-plan and keep implementations minimal.
- **Tests are part of the task**
- **Ask before** new cross-cutting architecture (global providers, new packages)
- **No magic strings** — next-intl for all UI copy
