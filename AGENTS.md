# my-noodles — agent instructions

Food-discovery store for imported snacks. We sell **discovery**, not a product grid.

**Read first:** [docs/VISION.md](./docs/VISION.md) — the north star for every feature, screen, and line of code.

## Litmus test (apply before every change)

Before proposing or shipping anything, ask:

> **Does this make the customer feel more welcome, more delighted, and more confident — and convinced — to try something new today?**

If the answer is not a clear **yes**, reconsider. The target feeling:

> _"Everything looks so tasty — what should I try?!"_

**Customer first, always.** Convenience for builders is secondary.

## What we are building (MVP)

Mobile-first, SEO-oriented food-import storefront. Behavioral data via a slick catalog, honest product cards, curated Collections, and cart → checkout. Ukrainian now, i18n-ready.

**Planned monorepo layout:**

```text
apps/web/          # Next.js App Router, MUI, next-intl, React Query
apps/api/          # NestJS, TypeORM, Postgres
packages/theme/    # MUI design system + country/brand skin engine
packages/api-clients/  # Storefront OpenAPI client (hey-api fetch) for apps/web
packages/integration-api-clients/  # Backend provider clients (Meest, NP, Ukrposhta, Telegram)
```

Stack highlights: TypeScript strict, React 19, Next.js 16, TanStack Query, MUI v9, react-hook-form + Zod, Zustand cart, NestJS + class-validator DTOs, JSONB i18n columns, ISR + View Transitions. Quality: oxlint + oxfmt.

## How to work in this repo

### Code discipline

- Match existing conventions; smallest correct diff.
- No over-engineering, no unrelated changes, no drive-by refactors.
- Prefer extending existing patterns over inventing new ones.
- Comments only for non-obvious business logic.
- Do not add tests unless asked or they cover meaningful behavior.
- Do not create commits or PRs unless explicitly requested. When committing, follow [.cursor/skills/git-commit/SKILL.md](./.cursor/skills/git-commit/SKILL.md).

### Product vs plumbing

- **Product:** how it feels, what the customer sees, honest copy, discovery, trust, delight.
- **Plumbing:** monorepo setup, linting, API shape, DB schema — necessary, but always in service of the experience above.

When trade-offs arise, choose the option that better serves the litmus test, even if it costs more implementation effort.
