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
apps/admin/        # Vite + TanStack Router admin SPA (orders ops)
apps/api/          # NestJS, TypeORM, Postgres
packages/theme/    # MUI design system + country/brand skin engine
packages/api-clients/  # Storefront + admin OpenAPI clients (hey-api fetch)
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

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
