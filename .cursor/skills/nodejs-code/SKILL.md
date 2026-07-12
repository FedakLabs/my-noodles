---
name: nodejs-code
description: 'Backend code changes in NestJS + TypeORM services (apps/api). TRIGGER when: adding/changing/fixing controllers, services, modules, entities, DTOs, exceptions, TypeORM migrations, external API clients (hand-written or OpenAPI-generated), guards/interceptors/pipes'
---

# Backend Implementation

Consult [references/common-patterns.md](./references/common-patterns.md) and [references/code-style-guide.md](./references/code-style-guide.md) before writing code.

**Paradigm:** OOP-first — services, adapters, clients, and bootstrap wiring are **classes**. Reserve standalone functions for pure stateless utilities (e.g. `slugify`, `parseBoolean`).

## Your Goal

1. Identify affected feature module(s) and layers (controller → service → repository/client)
2. Keep controllers thin; services own logic
3. Pass **`pnpm nx run api:validate`**

## Stack

- class-validator + global `ValidationPipe`
- Migrations only — `synchronize: false`
- Jest + supertest; tests co-located as `*.test.ts`
- Winston + OTEL bootstrap (`OTEL_ENABLED` opt-in for export)
- **OpenAPI** — `@nestjs/swagger` serves live spec at `/api/docs-json`; storefront TS client is generated in `packages/api-clients` via **`@hey-api/openapi-ts`** (not OpenAPI Generator)

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
