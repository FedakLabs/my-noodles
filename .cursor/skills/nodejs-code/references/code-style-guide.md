# Backend Code Style Guide (NestJS + TypeORM)

Conventions for TypeScript in `apps/api`. When unsure, grep the nearest analogous module and match its shape. Architecture reference: `docs/mvp-plan.md`.

---

## Table of Contents

1. [Language & TypeScript](#1-language--typescript)
2. [File & Class Naming](#2-file--class-naming)
3. [Layered Architecture](#3-layered-architecture)
4. [NestJS Modules & DI](#4-nestjs-modules--di)
5. [HTTP & Controllers](#5-http--controllers)
6. [Exceptions](#6-exceptions)
7. [DTOs & Validation](#7-dtos--validation)
8. [TypeORM Entities](#8-typeorm-entities)
9. [Migrations](#9-migrations)
10. [External API Integration](#10-external-api-integration)
11. [Configuration](#11-configuration)
12. [Logging, Tracing, Observability](#12-logging-tracing-observability)
13. [Rate Limiting](#13-rate-limiting)
14. [Tests](#14-tests)
15. [Code Formatting](#15-code-formatting)
16. [Anti-Patterns](#16-anti-patterns)
17. [Quick Sanity Checklist](#17-quick-sanity-checklist)

---

## 1. Language & TypeScript

### Module system
- Follow the project's `apps/api` tsconfig (Nx monorepo). Use standard ESM/CJS as configured — **do not** add `.ts` extensions to imports unless the repo already does.
- Prefer `import type` for type-only imports.

### Strictness
- Monorepo base enables `strict: true`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, etc. No `any` without a comment justifying it.
- Prefer `unknown` + narrowing over `any`.
- Avoid `!` non-null assertions unless the value was just validated or loaded from a required DB column.
- Use `readonly` on constructor-injected dependencies.

### Decorators
- NestJS, TypeORM, class-validator, and Swagger all use decorators — keep `emitDecoratorMetadata` enabled in tsconfig.
- Follow decorator order used in neighbouring controllers (route decorators before param decorators).

---

## 2. File & Class Naming

### Files
- **kebab-case** for files and folders.
- Feature modules under `src/application/<feature>/`.
- Suffixes:
  - `<feature>.module.ts`
  - `<feature>.controller.ts`
  - `<feature>.service.ts`
  - `<feature>.entity.ts` (entity class is singular: `product.entity.ts` → `Product`)
  - `<feature>.dto.ts`
  - `<feature>.exceptions.ts`
  - `index.ts` (barrel)
- Tests: co-located, tilde prefix: `~orders.test.ts`.
- Sub-features: nested folder (e.g. `application/products/facets/facets.controller.ts`).

### Classes
- **PascalCase** with role suffix:
  - `ProductsController`, `ProductsService`, `ProductsModule`
  - `Product` (entity)
  - `CreateOrderDto`, `ListProductsQueryDto`
  - `ProductNotFoundException`
- MVP storefront is public — no separate authenticated controller variants unless auth is added later.

### Barrel `index.ts`
Re-export public symbols for cross-module convenience:

```ts
export * from './products.service';
export * from './products.controller';
export * from './products.dto';
export * from './products.exceptions';
export * from './product.entity';
export * from './products.module';
```

Prefer importing via Nest module graph for runtime wiring; barrels are for types and tests.

---

## 3. Layered Architecture

Strict boundaries:

```text
Controllers → Services → Repositories / External clients → Postgres / HTTP
```

### Controllers
**Only:**
1. Declare routes (`@Controller`, HTTP method decorators).
2. Accept validated input (`@Body`, `@Query`, `@Param` typed as DTOs — validated by global `ValidationPipe`).
3. Apply route-level guards/interceptors/throttle decorators when needed.
4. Delegate to a service and return the result.

Controllers must **not**:
- Contain business logic, transactions, or direct `@InjectRepository` usage.
- Call external APIs directly.
- Orchestrate multiple services when one service method should own the flow.

```ts
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(dto);
  }
}
```

### Services
- `@Injectable()` business logic and orchestration.
- Inject repositories via `@InjectRepository(Entity)`.
- Inject other services and infra clients via constructor.
- Wrap external failures in domain exceptions.
- Own transactions (`DataSource.transaction` or `EntityManager`).

### Repositories / clients
- TypeORM `Repository<Entity>` — IO only.
- External clients: `@Injectable()` classes in `infrastructure/services/<Name>/client/`.

---

## 4. NestJS Modules & DI

### Feature module pattern

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Country, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

Register in `AppModule.imports`. Export providers other modules need.

### Injection
- **Default**: constructor injection — Nest resolves automatically.
- **Circular dependency** (rare): `forwardRef(() => OtherService)` on both sides — prefer redesign over lazy hacks.
- **Custom tokens**: `@Inject('TELEGRAM_CLIENT')` only when necessary (config providers).

### Shared / infra modules
- `TypeOrmModule.forRoot(...)` (or async factory) in `AppModule` using `ormconfig.ts`.
- Third-party modules: `ThrottlerModule.forRoot(...)`, `WinstonModule.forRoot(...)`.

---

## 5. HTTP & Controllers

### Global setup (bootstrap)
- `app.setGlobalPrefix('api')` — routes are `/api/...`, no versioning.
- Global `ValidationPipe`: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`.
- Swagger at `/api/docs-json` via `@nestjs/swagger`.

### Controller template

```ts
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  async list(@Query() query: ListProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.productsService.list(query);
  }

  @Get(':slug')
  async getBySlug(
    @Param('slug') slug: string,
    @Query() query: LocaleQueryDto,
  ): Promise<ProductDetailDto> {
    return this.productsService.getBySlug(slug, query.locale);
  }
}
```

### Query / path / body
- **Query DTOs** for filters, pagination (`page`, `limit` required when paginating, max 100), `locale`.
- **Body DTOs** for POST/PATCH with class-validator decorators.
- **Path params**: simple `@Param('slug')` or a small param DTO if multiple params need validation.

### Public storefront (MVP)
- No JWT guards on catalog/order endpoints.
- Honeypot on order POST: reject if hidden `company` field is filled (validated in DTO/service).

---

## 6. Exceptions

### Domain exceptions
Live in `<feature>.exceptions.ts`. Extend Nest HTTP exceptions:

```ts
import { NotFoundException } from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
  constructor(slug: string) {
    super({ message: 'Product not found', slug });
  }
}
```

Use the matching built-in when sufficient: `BadRequestException`, `ConflictException`, `TooManyRequestsException`.

### Wrapping external errors
Services translate infra/client errors — never leak raw axios errors to the client.

```ts
try {
  await this.telegramClient.sendOrderNotification(payload);
} catch (err) {
  this.logger.error('telegram.notify.failed', { orderId, err });
  // Order still succeeds — failure-tolerant per mvp-plan
}
```

When failure must fail the request:

```ts
if (axios.isAxiosError(err)) {
  throw new OrderNotificationException(err.message);
}
throw err;
```

### Do not
- `console.log` / `console.error` in feature code — use injected Nest `Logger` or Winston.
- Swallow errors with empty `catch {}` unless explicitly best-effort (document why).

---

## 7. DTOs & Validation

### Layout
- All DTOs in `<feature>.dto.ts` (request, query, response shapes as needed).
- Regex/constants above the classes that use them.

### class-validator
Every input field gets validators:

```ts
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(0)
  company?: string; // honeypot — reject in service if non-empty

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

### Swagger
Add `@ApiProperty()` on DTO fields exposed in OpenAPI (follow existing modules).

### Shared validators
- Reusable field decorators or small validator classes in `src/utils/validators/`.
- Pagination: validate `page`, `limit` (required when paginating, `limit` ≤ 100).

### DTO ↔ entity
- Response DTOs / mappers in the service — do not return raw entities with relations unless intentional.
- Localized JSONB fields: resolve by `?locale` in the service, expose plain strings in responses.

---

## 8. TypeORM Entities

### Naming
- Table: `@Entity({ name: 'products' })` — snake_case plural.
- Columns: camelCase in TS, snake_case in DB via `@Column({ name: 'price_minor' })`.
- Entity class: singular (`Product`, `Order`).

### Primary keys
- UUID: `@PrimaryGeneratedColumn('uuid')` (matches mvp-plan ER diagram).

### Timestamps
- `@CreateDateColumn()` on persistent entities; `@UpdateDateColumn()` where rows are updated.

### Localized JSONB (mvp-plan)
```ts
@Column({ type: 'jsonb' })
name: LocalizedString; // { uk: string; en?: string }
```
Resolve in service layer by locale query param.

### Relations
- Explicit inverse sides; avoid eager loading unless every caller needs it.
- `cascade` only when child cannot exist independently.

### Stock / derived fields
- `quantity` int; `inStock` derived in service/DTO as `quantity > 0` (not a stored column unless already migrated).

---

## 9. Migrations

- **Never** rely on `synchronize: true` — `ormconfig.ts` sets `synchronize: false` always.
- Files in `src/infrastructure/migrations/` with timestamp prefix.
- Generate via TypeORM CLI / Nx target (e.g. `migration:generate` / `migration:create`).
- Implement **both** `up` and `down`.
- Test locally: run → revert → run again.
- Data migrations: idempotent SQL (`ON CONFLICT DO NOTHING`, guarded updates).

---

## 10. External API Integration

### Hand-written client (MVP: Telegram)
Location: `infrastructure/services/Telegram/client/`

```ts
@Injectable()
export class TelegramClient {
  constructor(private readonly config: ConfigService) {}

  async sendOrderNotification(payload: OrderTelegramPayload): Promise<void> {
    // axios/fetch to Bot API — env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
  }
}
```

Register as provider in a small `TelegramModule` or `OrdersModule`; inject into `OrdersService`.

### OpenAPI-generated third-party clients
- Generated output under `infrastructure/services/<Service>/generated/` — **read-only**.
- Thin `@Injectable()` wrapper in `client/` exposing typed methods.
- Distinct from `packages/api-clients` (that package is **our** API client for the web app).

### Rules
- No business logic in clients — one method per remote operation.
- Config from env via `config.ts` — never hardcode tokens.

---

## 11. Configuration

- Root: `src/config.ts` — typed env access, frozen exports.
- Feature-specific: `<feature>.config.ts` when a module has many env vars.
- Never hardcode URLs, tokens, or credentials.

```ts
export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  chatId: process.env.TELEGRAM_CHAT_ID ?? '',
};
```

---

## 12. Logging, Tracing, Observability

- Bootstrap imports `otel-instrumentation.ts` **before** `NestFactory.create`.
- **OTLP export**: opt-in via `OTEL_ENABLED`; do not block local dev when off.
- **Logging**: Winston via `nest-winston` as Nest logger; structured fields, no PII (no raw phones in logs).
- Feature code: inject `Logger` (`new Logger(OrdersService.name)`) or use Winston adapter from Nest.

```ts
this.logger.log({ msg: 'order.created', orderId, totalMinor });
```

Do not import OTel SDK directly in feature modules — use bootstrap instrumentation + logger correlation.

---

## 13. Rate Limiting

Global `@nestjs/throttler` (~60 req/min per IP) + tighter limit on sensitive routes:

```ts
@Post()
@Throttle({ default: { limit: 5, ttl: 60_000 } })
async create(@Body() dto: CreateOrderDto) { ... }
```

On limit exceeded, Nest returns 429 — map to friendly message in exception filter if the project adds one.

---

## 14. Tests

- Naming: `~<feature>.test.ts`, co-located.
- **Unit**: `@nestjs/testing` `Test.createTestingModule` with mocked providers/repos.
- **E2E**: supertest against bootstrapped app; `POST /api/orders`, `GET /api/products`, etc.
- Jest `testMatch` includes `**/~*.test.ts`.

Cover: happy path, validation 400, not-found 404, external client failure behavior, throttling where relevant.

Run: `pnpm nx run api:test` or `api:quality-check`.

---

## 15. Code Formatting

- Root Prettier: 2 spaces, single quotes, semicolons, `trailingComma: all`, printWidth ~110.
- Import order (simple-import-sort via ESLint):
  1. External packages (`@nestjs/*`, `typeorm`, `class-validator`, …)
  2. Same-module relative imports
  3. Cross-module / infrastructure / utils
- ESLint: node/nest preset from `configs/eslint` — no inline disables without justification.

---

## 16. Anti-Patterns

| Anti-pattern | Do instead |
| --- | --- |
| Business logic in controller | Move to service |
| `@InjectRepository` in controller | Service only |
| Raw `fetch`/`axios` in controller/service without a client class | Infra client in `infrastructure/services/` |
| Returning raw TypeORM entity with hidden columns | Map to response DTO |
| DTO field without class-validator | Add validators |
| Schema change without migration | Generate migration; keep `synchronize: false` |
| Hardcoded secrets/URLs | `config.ts` + env |
| Disabling OTEL hooks in bootstrap | Keep instrumentation; gate export with `OTEL_ENABLED` |
| `console.log` for diagnostics | Nest `Logger` / Winston |
| God `AppModule` providers | Feature `*.module.ts` per domain |
| Copy-paste validator | Add to `utils/validators/` and reuse |

---

## 17. Quick Sanity Checklist

Before declaring done:

- [ ] Controller is route-only; logic in service
- [ ] Input DTOs validated (global pipe + decorators)
- [ ] External calls go through injectable clients; errors handled in service
- [ ] Feature module registered in `AppModule`
- [ ] DB changes have `up` + `down` migrations
- [ ] `pnpm nx run api:quality-check` passes
- [ ] Swagger/OpenAPI still generates if DTOs/controllers changed
