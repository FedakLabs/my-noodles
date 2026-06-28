---
name: nodejs-code
description: 'Backend code changes in NestJS + TypeORM services (apps/api). TRIGGER when: adding/changing/fixing controllers, services, modules, entities, DTOs, exceptions, TypeORM migrations, external API clients (hand-written or OpenAPI-generated), guards/interceptors/pipes; any file under apps/api/src/application/ or apps/api/src/infrastructure/. SKIP: pure docs, OpenSpec proposals, CI/CD config.'
---

# Backend Implementation (NestJS + TypeORM)

You are implementing **`apps/api`**: NestJS 11, TypeORM, PostgreSQL, class-validator, Jest. Feature code lives under `application/[feature]/` and `infrastructure/` per `docs/mvp-plan.md`.

**Always grep the repo** for the nearest analogous module before writing code. Examples (products, orders) are illustrative.

Consult [references/common-patterns.md](./references/common-patterns.md) and [references/code-style-guide.md](./references/code-style-guide.md) before writing code.

**Paradigm:** OOP-first — services, adapters, clients, and bootstrap wiring are **classes**. Reserve standalone functions for pure stateless utilities (e.g. `slugify`, `parseBoolean`).

## Your Goal

1. Identify affected feature module(s) and layers (controller → service → repository/client)
2. Use NestJS modules, DTOs, and TypeORM patterns
3. Keep controllers thin; services own logic
4. Pass **`pnpm nx run api:validate`**

Migration after schema changes:

```bash
pnpm nx run api:migration:run
```

(Use actual Nx target names once wired.)

## Stack

- NestJS 11, `@nestjs/typeorm`, `@nestjs/swagger`, `@nestjs/throttler`
- class-validator + global `ValidationPipe`
- Migrations only — `synchronize: false`
- Jest + supertest; tests co-located as `~*.test.ts`
- Winston + OTEL bootstrap (`OTEL_ENABLED` opt-in for export)
- **OpenAPI** — `@nestjs/swagger` serves live spec at `/api/docs-json`; storefront TS client is generated in `packages/api-clients` via **`@hey-api/openapi-ts`** (not OpenAPI Generator)

## Repo layout

See `docs/mvp-plan.md` — `apps/api/src/application/[feature]/`, `infrastructure/migrations/`, `infrastructure/external-apis/telegram/`.

**Preconditions:** `application/`, `infrastructure/`, `app.module.ts` exist. Public storefront — no auth guards unless explicitly requested.

If preconditions fail, stop and tell the user.

## Workflow (short)

1. **Analyze** — scope, modules, layers, external clients
2. **Read** `code-style-guide.md`; grep analogous feature
3. **Plan** files (DTO, controller, service, module, migration, tests)
4. **Implement** — validators on all inputs; migrations for schema
5. **Test** — unit + supertest where applicable
6. **Run** `pnpm nx run api:validate`

After DTO/controller changes that affect the public API, regenerate the storefront client (API must be running on port 3001):

```bash
pnpm nx run api:generate:openapi
pnpm --dir apps/web run generate:clients
pnpm nx run api-clients:build
pnpm nx run web:type-check
```

## Reference Files

- **`references/code-style-guide.md`**
- **`references/common-patterns.md`**

## Notes

- Match nearest existing module
- Tests required for new behavior
- Ask before new global bootstrap/guard changes
- Never skip migrations; never hardcode secrets
