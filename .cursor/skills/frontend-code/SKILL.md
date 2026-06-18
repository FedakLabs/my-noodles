---
name: frontend-code
description: 'Primary skill for all frontend code changes — features, bug fixes, refactors, and design implementations. Use whenever the user asks to add, change, fix, or build anything in the UI. Covers Next.js App Router, screens, components, forms, API hooks, cart, i18n, and MUI theming. Consult references/common-patterns.md and references/code-style-guide.md before writing code. Stack: TS strict, React 19, Next.js 16, TanStack Query, MUI v9 (packages/theme), react-hook-form + Zod, next-intl, nuqs, Zustand, Vitest.'
---

# Frontend Implementation (my-noodles storefront)

You are implementing UI for **`apps/web`**: a mobile-first Next.js storefront. Architecture source of truth: `docs/mvp-plan.md` (Frontend + Architecture sections).

**Before writing code:** grep or Glob the repo for the nearest analogous feature. Do **not** assume files, hooks, or components from other projects exist here.

Consult [references/common-patterns.md](./references/common-patterns.md) and [references/code-style-guide.md](./references/code-style-guide.md) before implementing.

## Your Goal

Given a requirement (design, bug, or feature), implement it by:

1. Mapping the change to the correct layer (`app/` route shell → `screens/` → `components/`, plus `api/` hooks or `hooks/` stores)
2. Using **`packages/theme`** tokens and MUI components — no raw hex/px drift
3. Handling loading, error, and empty states
4. Running quality checks — **MUST PASS**

**CRITICAL:** Implementation is NOT complete until:

```bash
pnpm nx run web:fix
```

(format → lint → type-check → Vitest). Use the actual Nx target names once wired.

## Stack & Tools

- **Next.js 16** App Router (`app/[locale]/…`), ISR + Server Components where planned
- **React 19**, **TypeScript** strict (`exactOptionalPropertyTypes`)
- **TanStack Query v5** — client data; prefetch + `HydrationBoundary` for SSR/ISR
- **MUI v9** + **`packages/theme`** (design system, skin engine)
- **next-intl** — UI strings; `localePrefix: 'always'` (`/uk/…`)
- **react-hook-form + Zod 4** — forms (checkout, etc.)
- **nuqs** — URL search params (catalog filters); schema in `screens/[feature]/search-params/`
- **Zustand + persist** — cart (client-only until checkout)
- **packages/api-clients** — generated OpenAPI axios client; **`apps/web/src/api`** wraps it with RQ hooks
- **Vitest** + Testing Library — co-located `*.test.tsx`
- **motion** — micro-interactions; native View Transitions where enabled

## Repo layout (`apps/web/src`)

```text
app/           # routing only — thin page.tsx → screens/
screens/       # one folder per page; search-params/ for nuqs
components/    # feature UI (+ *.test.tsx)
api/           # React Query hooks + query-key factories
hooks/         # cart, analytics, skin resolver consumers, …
utils/         # formatCurrency, helpers
shared/        # QueryClient, env, shared types
```

Providers live in `app/layout.tsx` + `app/providers.tsx` (MUI cache, theme, QueryClient, next-intl, NuqsAdapter).

## Design system (`packages/theme`)

- Semantic tokens: `theme.colors.*`, `theme.customSpacing.*`, `theme.borderRadius.*`
- Typography: use `<Typography variant="…">` — avoid overriding `fontSize`/`fontWeight` via `sx`
- **Glob `packages/theme`** and existing components before adding one-off styling
- Country/brand skins: `resolveSkin()` → CSS variables on card/page root (see mvp-plan)
- Prefer MUI primitives (`Stack`, `Box`, `Button`, `TextField`, `Dialog`) styled via theme — this project does **not** ship a separate `packages/ui` primitive library

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
1. screens/catalog/search-params/catalog.search.ts — add sort parser
2. api/products/products.ts — include sort in query key + API params
3. components/catalog/sort-select.tsx — UI control
4. components/catalog/sort-select.test.tsx — tests
5. messages/uk/catalog.json — i18n keys
```

### Step 3: Implement

- Match existing patterns in the touched feature
- User-facing text via **next-intl** (`useTranslations`)
- API calls through **`apps/web/src/api`** hooks, not raw axios in components
- Invalidate query keys on mutations

### Step 4: Tests

Co-located Vitest tests: render, interaction, validation, edge cases.

### Step 5: Quality checks

```bash
pnpm nx run web:fix
```

Fix and re-run until green.

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
