# Nodejs Code Style Guide

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
15. [Anti-Patterns](#15-anti-patterns)
16. [Quick Sanity Checklist](#16-quick-sanity-checklist)

---

## 1. Language & TypeScript

### Path aliases (`@/*`)

| Import from                                                    | Use                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| Same feature folder (internal)                                 | Relative — `./orders.service`, `./order.entity`             |
| Sibling feature in `application/` (same layer)                 | Relative — `../products/product.entity`                     |
| Another module’s **public API** (cross-layer or cross-feature) | Barrel — `@/infrastructure/logging`, `@/application/orders` |
| Single-file top-level modules                                  | `@/config`, `@/configs/api`, `@/env`                        |

**Do not** reach into another module’s internal files when that module exposes a barrel — import the folder so the module boundary stays explicit and refactors stay local.

**NestJS modules:** when importing a `*Module` (e.g. `LoggingModule`, `TelegramModule`) from outside that folder, always use the module’s barrel — never `logging.module`, `telegram.module`, etc.

```ts
// app.module.ts — feature + infra modules via barrels
import { OrdersModule } from './application/orders';
import { LoggingModule } from './infrastructure/logging';
import { prepareDataSource } from './infrastructure/persistence';

// application/checkouts/checkouts.module.ts — integration module via barrel
import { TelegramModule } from '@/application/telegram';

// application/orders/orders.module.ts — internals stay relative
import { Product } from '../products/product.entity';
import { OrdersService } from './orders.service';
```

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
- Tests: co-located, e.g. `orders.test.ts`.
- Sub-features: nested folder (e.g. `application/products/products.controller.ts` with `GET /products/filters`).

### Classes

- **PascalCase** with role suffix:
  - `ProductsController`, `ProductsService`, `ProductsModule`
  - `Product` (entity)
  - `CreateOrderDto`, `ListProductsQueryDto`
  - `ProductNotFoundException`
- No separate authenticated controller variants unless the product adds auth.

### Paradigm: classes first

We work in an **OOP-first** style aligned with NestJS, TypeORM, and class-validator.

| Use a **class**                                                            | Use a **function**                                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Services, controllers, modules, entities, DTOs, filters, interceptors      | Pure stateless helpers with no lifecycle (e.g. `slugify`, `parseBoolean`, `createAppLogger`)           |
| Bootstrap/adapters that compose dependencies (e.g. Nest filter wiring)     | Small transforms where FP is clearer (e.g. `formatCurrency`, array coercions in `utils/transformers/`) |
| External API clients (`ApiClient` subclasses in `@my-noodles/api-clients`) | One-off validators reused across DTOs when a decorator factory is enough                               |

Keep **pure primitives** as functions in `@my-noodles/api-lib/utils` or `apps/api/src/utils/` when they have no state and no framework coupling.

### Barrel `index.ts`

Every **module folder** (feature in `application/`, subsystem in `infrastructure/`) should have an `index.ts` that re-exports its **public** symbols. Other code imports from the barrel, not from deep files — this scopes imports to the module and hides internal layout.

The barrel is the module’s contract: export Nest `*Module` classes, services/entities other features need, and bootstrap adapters (middleware, filters). Keep helpers used only inside the folder unexported.

```ts
// infrastructure/logging/index.ts
export { appLogger, LoggingModule } from './logging.module';
export { LoggingInterceptor } from './logging.interceptor';

// infrastructure/exceptions/index.ts
export { ExceptionsFilter } from './exceptions.filter';

// infrastructure/persistence/index.ts
export { createAppDataSource, prepareDataSource } from './data-source';
export { TimestampEntity } from './timestamp.entity';

// application/orders/index.ts
export * from './orders.module';
export * from './orders.service';
export * from './order.entity';
```

Consumers:

```ts
import { LoggingModule, appLogger } from '@/infrastructure/logging';
import { ExceptionsFilter } from '@/infrastructure/exceptions';
import { OrdersModule } from '@/application/orders';
import { TimestampEntity } from '@/infrastructure/persistence';
```

**Inside** the same module folder, keep relative imports to sibling files (`./orders.service.js`). **Outside** the module, use the barrel only — including `AppModule`, `index.ts` bootstrap, tests, seed scripts, and cross-feature services.

Nest runtime wiring still goes through `@Module({ imports: [...] })`; barrels are how other folders reference a module without knowing its file layout.

---

## 3. Layered Architecture

Strict boundaries:

```text
Controllers
└─▶ Services
    ├─▶ Repositories
    │   └─▶ DB
    └─▶ External Clients
        └─▶ HTTP APIs
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
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(dto);
  }
}
```

### Services

- `@Injectable()` business logic and orchestration.
- Inject repositories via `@InjectRepository(Entity)`; inject peer services and infra clients via `@Inject(Class)`.
- Wrap external failures in domain exceptions.
- Own transactions (`DataSource.transaction` or `EntityManager`).

### Repositories

- TypeORM `Repository<Entity>` — IO only.

### Clients

- Framework-agnostic `*Api` client classes live in `@my-noodles/api-clients/<provider>` and extend `ApiClient` from `@my-noodles/api-lib/api-client`.
- Nest wiring + optional domain helpers: `application/<provider>/` (`*.config.ts`, `*.service.ts`, `*.module.ts` with `useFactory` registration).

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

- **Controllers**: `@Inject(ServiceClass)` on every constructor param — do not rely on implicit class-token resolution.
- **Services injecting other providers** (clients, peer services): `@Inject(Class)` as well.
- **TypeORM**: `@InjectRepository(Entity)`, `@InjectDataSource()`.
- **Circular dependency** (rare): `forwardRef(() => OtherService)` on both sides — prefer redesign over lazy hacks.
- **Custom tokens**: `@Inject('TELEGRAM_CLIENT')` only when necessary (config providers).

### Shared / infra modules

- `TypeOrmModule.forRoot(...)` in `AppModule` via `prepareDataSource(config)` from `infrastructure/persistence/prepare-data-source.ts`.
- Third-party modules: `ThrottlerModule.forRoot(...)`, `WinstonModule.forRoot(...)`.

---

## 5. HTTP & Controllers

### Controller template

```ts
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  async list(@Query() query: ListProductsQueryDto): Promise<PaginatedProductsDto> {
    return this.productsService.list(query);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string): Promise<ProductDetailDto> {
    return this.productsService.getBySlug(slug);
  }
}
```

### Query / path / body

- **Query DTOs** for filters, pagination (`page`, `limit` required when paginating, max 100), `locale`.
- **Body DTOs** for POST/PATCH with class-validator decorators.
- **Path params**: simple `@Param('slug')` or a small param DTO if multiple params need validation.

---

## 6. Exceptions

### Raw base + presets (`@my-noodles/api-lib/exceptions`)

Framework-agnostic — **not** Nest `HttpException` subclasses. Body shape for every error:

```ts
{
  (status, code, message, payload);
}
```

Presets: `BadRequestException`, `NotFoundException`, `ConflictException`, `TooManyRequestsException`, `ServiceUnavailableException`, `ServerSideException`, `ValidationException`.

### Domain exceptions

Live in `<feature>.exceptions.ts`. Extend the raw lib base / presets:

```ts
import { AppException, HttpStatus, NotFoundException } from '@my-noodles/api-lib/exceptions';

export class CheckoutNotFoundException extends NotFoundException {
  constructor(checkoutId: string) {
    super('checkout_not_found', 'Checkout not found', { checkoutId });
  }
}

export class CheckoutExpiredException extends AppException<{ checkoutId: string }> {
  constructor(checkoutId: string) {
    super(HttpStatus.CONFLICT, 'checkout_expired', 'Checkout expired', { checkoutId });
  }
}
```

Use the matching preset when sufficient: `BadRequestException`, `ConflictException`, `NotFoundException`, `TooManyRequestsException`.

### Custom filter (Nest coupling lives here only)

`ExceptionsFilter` (`exceptions.filter.ts`) catches everything, maps Nest built-ins (ValidationPipe, route 404, throttler 429, …) and unknown errors into our body, logs, and replies via `httpAdapter.reply()`. Register globally in bootstrap / test apps — do **not** wrap domain exceptions in Nest `HttpException`.

### Wrapping external errors

Services translate infra/client errors — never leak raw axios errors to the client.

```ts
try {
  await this.notificationService.send(payload);
} catch (err) {
  this.logger.error('notification.failed', { orderId, err });
  // Best-effort side effect — document when the request still succeeds
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

- `console.log` / `console.error` in feature code — use injected Winston via `APP_LOGGER`.
- Swallow errors with empty `catch {}` unless explicitly best-effort (document why).
- Extend Nest `HttpException` for domain errors — extend `@my-noodles/api-lib/exceptions` instead.

---

## 7. DTOs & Validation

### Layout

- All DTOs in `<feature>.dto.ts` (request, query, response shapes as needed).
- Nest-facing DTO classes must live in files matched by the OpenAPI generation conventions. Prefer `*.dto.ts`; keep stable imports through small barrel files when moving shared DTOs.
- Regex/constants above the classes that use them.

### class-validator

Every input field gets validators:

```ts
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

### Swagger

Prefer `class-validator` decorators on DTO fields and let OpenAPI generation infer simple schema metadata from TypeScript and validators.

Add `@ApiProperty()` / `@ApiPropertyOptional()` only when the generated schema needs metadata that cannot be safely inferred, such as custom descriptions/examples, enum schema names, UUID/date-time formats without an equivalent validator, `nullable: true`, or mapped/intersection DTO cases that drop inherited fields.

**Response strings (`string | null`)** — set `{ type: String, nullable: true }` on `@ApiProperty()` / `@ApiPropertyOptional()`. Union types collapse to `Object` under `emitDecoratorMetadata`, so Swagger would otherwise emit `type: object` for locale-resolved copy.

### Shared validators

- Reusable field decorators or small validator classes in `src/utils/validators/`.
- Pagination: extend `PaginationQueryDto` / `PaginatedMetaDto` from `src/utils/pagination.ts` — see [common-patterns §7](./common-patterns.md#7-validators--pipes).

### Response shapes (entity vs DTO)

**Default:** return the entity (or a typed pick of its columns) when the handler is a straight load-and-respond — no extra response DTO that mirrors the entity field-for-field.

**Add a response DTO or mapper only when there is a concrete reason**, for example:

- Aggregating data from multiple sources (join + computed fields not on one entity)
- Hiding internal columns (cost, internal flags, soft-delete metadata)
- Resolving localized JSONB to a plain string for the requested `?locale`
- Shaping a write model differently from persistence (checkout payload ≠ order row)

If a response DTO would duplicate the entity one-to-one, skip it — two shapes to maintain with no benefit.

Input/query DTOs (`CreateOrderDto`, `ListProductsQueryDto`) stay mandatory for validation at the boundary.

---

## 8. TypeORM Entities

### Naming

- Table: `@Entity({ name: 'products' })` — snake_case plural.
- Columns: camelCase in TS, snake_case in DB via `@Column({ name: 'price_minor' })`.
- Entity class: singular (`Product`, `Order`).

### Primary keys

Choose per table — do not default every entity to UUID.

| Prefer UUID (`uuid`)                                                              | Prefer incremental (`increment` / `bigint`)                             |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| IDs exposed in public APIs, URLs, or client-visible references (orders, products) | Internal-only rows (audit logs, job queues, join tables never surfaced) |
| Merge/replicate across environments without collision                             | High-volume append-only tables where sequential scan locality matters   |
| Opaque, non-guessable identifiers for security-sensitive resources                | Admin-only tables where numeric IDs are acceptable                      |

```ts
// Public-facing resource (PostgreSQL 18+ — DB-generated UUID v7)
@UuidV7PrimaryColumn()
id!: string;

// Internal lookup / high-volume log
@PrimaryGeneratedColumn()
id!: number;
```

Use UUID when the ID leaves the service boundary; use incremental when the row stays internal and sequential IDs are simpler.

### Timestamps

Every entity extends `TimestampEntity` (`infrastructure/persistence/timestamp.entity.ts`):

```ts
export abstract class TimestampEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
```

```ts
@Entity({ name: 'products' })
export class Product extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;
  // ...
}
```

- `created_at` / `updated_at` — automatic insert/update tracking.
- `deleted_at` — nullable; TypeORM excludes set rows from normal queries. Use `repository.softRemove()` / `softDelete()` instead of hard `delete()` unless explicitly required.

### Localized JSONB

```ts
@Column({ type: 'jsonb' })
name: LocalizedString; // { uk: string; en?: string }
```

Resolve in service layer by locale query param.

### Repository queries

Prefer **type-safe** `Repository` APIs over `createQueryBuilder` string columns:

| Use                                                         | When                                                                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `find`, `findOne`, `findAndCount`, `count`                  | Listing, detail, filtered counts                                                                                     |
| `FindOptionsWhere<Entity>` + `In`, `Between`, `MoreThan`, … | Filters on entity + relation properties                                                                              |
| `relations`, `order`, `skip`, `take`, `select`              | Eager load, sort, pagination, partial rows                                                                           |
| In-memory aggregation on a bounded filtered set             | Facet counts / min–max when result sets stay small enough to load in one query                                       |
| `createQueryBuilder`                                        | Only when the above cannot express the query (e.g. complex SQL, window functions, bulk relation API in seed scripts) |

**Do not** scatter `'product.price_minor'` / `'category.slug'` strings in services — renames will not be caught by TypeScript.

---

## 9. Migrations

- **Never** rely on `synchronize: true` — `prepareDataSource()` sets `synchronize: false` always.
- Migration classes in `src/infrastructure/migrations/*.ts` (CLI helpers live in `migrations/scripts/`).
- **Never** rely on typeorm automatic migration generation, prepare migration by hand with thorough inspection of schema changes, indexes creation, etc
- Implement **both** `up` and `down`.
- Test locally: `pnpm nx run api:migration:run` → `pnpm nx run api:migration:revert` → run again.

### SQL style

- One `queryRunner.query(\`...\`)`per logical step; use`--` comments inside SQL to label sections.
- **Unquoted lowercase** identifiers for tables/columns (`products`, `created_at`) — PostgreSQL folds them consistently.
- Column layout: align types; put `created_at`, `updated_at`, `deleted_at` on every domain table.
- **String columns:** use `TEXT` in PostgreSQL (same performance as `VARCHAR(n)`; avoid arbitrary length caps in SQL).
- Name constraints explicitly: `{table}_pkey`, `{table}_{column}_key` (unique), `{child}_{parent}_fk` (foreign keys).
- **No DB defaults for business/content fields** (`currency`, `flavor`, `status`, `sort_order`, empty arrays, placeholder JSON). Seed scripts and application code must supply intentional values. DB defaults are only for infrastructure: `uuidv7()` (PostgreSQL 18+), timestamp columns (`now()`).

### Relations & foreign keys

- **Foreign keys — default for every relationship:**

```sql
parent_id UUID NOT NULL
    CONSTRAINT child_parent_fk
        REFERENCES parent(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
```

| Situation                      | `ON DELETE`                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------- |
| All FKs (required or optional) | `RESTRICT` — block parent delete while children reference it                      |
| Never                          | `CASCADE` — silent child deletes risk data loss                                   |
| Never                          | `SET NULL` — hides broken references; reassign or soft-delete in app code instead |

**Why `ON UPDATE CASCADE` everywhere:** UUID PKs are effectively immutable, so this rarely fires; when a key _does_ change, children stay consistent automatically. Cost is negligible; omitting it can surface surprise FK errors on rare updates.

**Why not `ON DELETE CASCADE`:** deleting a parent must be an explicit application decision (soft-delete via `deleted_at`, or delete children in code). DB-level cascade can orphan audit trails and order history.

- Indexes for FKs and sort columns: **partial** `WHERE deleted_at IS NULL` so soft-deleted rows stay out of hot paths.

```sql
CREATE INDEX idx_products_country_id ON products(country_id) WHERE deleted_at IS NULL;
```

- Explicit inverse sides; avoid eager loading unless every caller needs it.
- **Every FK**: `onUpdate: 'CASCADE'` — keeps referential integrity when a parent PK changes.
- **Never** `onDelete: 'CASCADE'` — avoids silent cascade wipes; use `onDelete: 'RESTRICT'` on all FKs (including optional ones such as `products.brand_id` — detach or reassign in app code before deleting a brand).
- TypeORM `cascade: true` on `@OneToMany` / `@OneToOne` is **persist cascade** (save/load), not a DB `ON DELETE CASCADE` — use sparingly and only when children are always saved with the parent in the same transaction.
- `@JoinTable` join / inverse join columns: set `onUpdate: 'CASCADE'` and `onDelete: 'RESTRICT'` on both sides in the **migration** (TypeORM `@JoinTable` metadata may not expose FK actions — keep DB constraints explicit in SQL).

> **Why `RESTRICT` + soft-delete, not `CASCADE`.** Data is the asset that outlives the code: customers, orders, and the engagement signals we use for personalization can't be regenerated once lost. Applications _have_ bugs — a wrong `where`, a mis-scoped admin action, a bad script — and a hard `ON DELETE CASCADE` quietly turns one erroneous parent delete into a silent multi-table wipe with no restore point. `RESTRICT` makes the database refuse that delete, forcing deletion to be an _explicit, intentional_ app decision; pairing it with soft-delete (`deleted_at` via `softRemove` / `softDelete`) keeps the row recoverable and preserves the audit trail. It's the deliberate compromise standard in SRE/data-stewardship practice (e.g. Google's _SRE_ book on data integrity & defense-in-depth recovery): treat data as deleted for the app, but cheap to restore when — not if — something goes wrong. Note this is orthogonal to the FK action: soft-delete is an `UPDATE`, so it never triggers `ON DELETE` at all; `RESTRICT` only guards against accidental _hard_ deletes.

```ts
@ManyToOne(() => Country, (country) => country.products, {
  nullable: false,
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
})
@JoinColumn({ name: 'country_id' })
country!: Country;
```

### TypeScript migration template

```ts
export class AddFeature1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Add columns
      ALTER TABLE products
      ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
      DROP COLUMN IF EXISTS featured;
    `);
  }
}
```

- `down` mirrors `up` in **reverse order**; use `DROP … IF EXISTS` / `DROP COLUMN IF EXISTS`.
- Match entity FK options in TypeORM **and** in migration SQL (TypeORM `@JoinTable` may not emit FK actions — keep them explicit in SQL).

---

## 10. External API Integration

### Base class (`@my-noodles/api-lib/api-client`)

Hand-written outbound clients extend **`ApiClient`**: fetch + OTEL spans + structured outgoing HTTP logs. Subclasses implement `getBaseUrl()`; call `this.get<T>()` / `this.post<T>()` for requests.

```ts
export abstract class ApiClient {
  protected constructor(logger: Logger) {}

  protected abstract getBaseUrl(): string;

  protected get<T>(params: ApiClientRequestConfig): Promise<T> {
    /* … */
  }
  protected post<T>(params: ApiClientRequestConfig): Promise<T> {
    /* … */
  }
}
```

### Provider clients (`@my-noodles/api-clients/<provider>`)

Framework-agnostic HTTP client classes live in **`packages/api-clients`**. Nest registers them via `useFactory` in `apps/api` (`application/<provider>/`).

```ts
// packages/api-clients/src/meest/meest.client.ts
export class MeestApi extends ApiClient {
  constructor(
    private readonly settings: MeestClientOptions,
    logger: Logger,
  ) {
    super(logger);
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }
}
```

```ts
// apps/api/src/application/meest/meest.module.ts
providers: [
  {
    provide: MeestApi,
    useFactory: (logger: Logger) => new MeestApi({ apiBaseUrl: meestConfig.apiBaseUrl }, logger),
    inject: [APP_LOGGER],
  },
  MeestService,
],
```

### OpenAPI-generated third-party clients

When this API must call **another service’s HTTP API**, prefer adding the raw client under **`packages/api-clients/<provider>/`**. Generate from the upstream spec with **`@hey-api/openapi-ts`** when a spec exists; otherwise hand-write an `ApiClient` subclass. Nest wiring lives in `application/<provider>/` like any other feature module:

```text
packages/api-clients/<provider>/
├── <provider>.client.ts   # *Api extends ApiClient; raw upstream calls
└── index.ts

apps/api/src/application/<provider>/
├── <provider>.config.ts
├── <provider>.service.ts  # optional — mapping/formatting when needed
├── <provider>.module.ts   # useFactory + exports *Service
└── index.ts
```

- **`*Api`** — framework-agnostic: options + logger, `ApiClient` subclass, upstream-shaped methods.
- **`*Service` (optional)** — Nest provider in `apps/api`; injects `*Api`; exposes domain-friendly methods to feature modules/adapters.
- Storefront OpenAPI client for the web app also lives in **`packages/api-clients/storefront`** (`@hey-api/client-fetch`).

### Rules

- No business logic beyond request shaping and domain exception mapping.
- Secrets (API tokens, passwords, private keys) in env via `<feature>.config.ts` — not in source. Non-sensitive constants (public API base URLs, notification template IDs, example recipient emails safe to commit) may be hardcoded.
- Map `ApiClientException.httpStatus` to domain exceptions at the service boundary when needed.

---

## 11. Configuration

- Root: `src/config.ts` — `loadConfig()` maps env → validated `Config` (not raw env DTOs).
- Env files (via `env.ts` → `loadAppEnv()`, later overrides earlier): `.env` → `.env.{NODE_ENV}` → `.env.local`.
- `Config.rootDirname` — absolute path to application source root (`src/` at dev time); used by `prepareDataSource()` for entity/migration globs.
- Feature-specific: `<feature>.config.ts` when a module has many env vars.
- Secrets and credentials from env — never commit them in source. URLs and other non-sensitive defaults may live in code when stable and public.

```ts
export const config = loadConfig();

// infrastructure/persistence/prepare-data-source.ts
export function prepareDataSource(appConfig: Config): DataSourceOptions {
  return {
    migrations: [`${appConfig.rootDirname}/infrastructure/migrations/[0-9]*-*.{js,ts}`],
    entities: [`${appConfig.rootDirname}/application/**/*.entity.{js,ts}`],
    // ...
  };
}

// instrumentation.ts — side-effect preload; started via `node --import=./dist/instrumentation.js`
if (config.otel.enabled) {
  const sdk = new NodeSDK({/* ... */});
  sdk.start();
}
```

- Optional integration config lives in `application/<feature>/<feature>.config.ts` — not on root `Config`.

---

## 12. Logging, Tracing, Observability

- OTEL loads **before** the app via Node preload: `node --import=./dist/instrumentation.js dist/index.js`.
- `instrumentation.ts` is a side-effect module — no init/shutdown helpers in `index.ts` or graceful shutdown.
- **OTLP export**: opt-in via `OTEL_ENABLED`; no-op preload when off (local dev unaffected).
- **Logging**: raw `winston` via `@my-noodles/api-lib/logging` — one instance created by `createAppLogger()` as `appLogger` in `logging.module.ts`, provided as `useValue: appLogger` under the `APP_LOGGER` token. Access logging via `LoggingInterceptor` (`logging.interceptor.ts`).
- Bootstrap: import `appLogger` directly for startup logs and `ExceptionsFilter`.
- Feature / infrastructure code: inject `@Inject(APP_LOGGER) private readonly logger: Logger`.

```ts
this.logger.info({ msg: 'order.created', orderId, totalMinor });
this.logger.error({ msg: 'order.notify.failed', orderId, error: err.message });
```

Do not use Nest `new Logger()` or a second Winston instance — inject `APP_LOGGER` (or import `appLogger` in bootstrap).

Do not import OTel SDK directly in feature modules — use bootstrap instrumentation + logger correlation.

---

## 13. Rate Limiting

Global `@nestjs/throttler` (~60 req/min per IP) + tighter limit on sensitive routes:

```ts
@Post()
@Throttle({ default: { limit: 5, ttl: 60_000 } })
async create(@Body() dto: CreateOrderDto) { ... }
```

On limit exceeded, Nest returns 429 — `ExceptionsFilter` maps it to `TooManyRequestsException` (`code: 'too_many_requests'`).

---

## 14. Tests

- Naming: `<feature>.test.ts`, co-located.
- **Unit**: `@nestjs/testing` `Test.createTestingModule` with mocked providers/repos.
- **E2E**: supertest against bootstrapped app; `POST /api/orders`, `GET /api/products`, etc.
- Jest `testMatch` includes `**/*.test.ts`.

Cover: happy path, validation 400, not-found 404, external client failure behavior, throttling where relevant.

Run: `pnpm nx run api:test` or `api:validate`.

---

## 15. Anti-Patterns

| Anti-pattern                                                     | Do instead                                                                                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Business logic in controller                                     | Move to service                                                                                                               |
| `@InjectRepository` in controller                                | Service only                                                                                                                  |
| `createQueryBuilder` with raw column strings for simple filters  | `find` / `count` + `FindOptionsWhere` + `In`, `Between`, …                                                                    |
| Raw `fetch`/`axios` in controller/service without a client class | `ApiClient` subclass (`*Api`) in `@my-noodles/api-clients/<provider>`; Nest `*Service`/`*Module` in `application/<provider>/` |
| Response DTO that mirrors the entity one-to-one                  | Return entity (or pick columns); DTO only when shape genuinely differs                                                        |
| DTO field without class-validator                                | Add validators                                                                                                                |
| Schema change without migration                                  | Generate migration; keep `synchronize: false`                                                                                 |
| `ON DELETE CASCADE` on FKs                                       | `onDelete: 'RESTRICT'` (+ `onUpdate: 'CASCADE'`)                                                                              |
| Entity without `created_at` / `updated_at` / `deleted_at`        | Extend `TimestampEntity`                                                                                                      |
| Hard `repository.delete()` on catalog rows                       | `softRemove` / `softDelete` unless explicitly required                                                                        |
| Hardcoded secrets/URLs                                           | `config.ts` + env                                                                                                             |
| Disabling OTEL hooks in bootstrap                                | Keep instrumentation; gate export with `OTEL_ENABLED`                                                                         |
| `console.log` for diagnostics                                    | Nest `Logger` / Winston                                                                                                       |
| God `AppModule` providers                                        | Feature `*.module.ts` per domain                                                                                              |
| Copy-paste validator                                             | Add to `utils/validators/` and reuse                                                                                          |
| Nest `HttpException` subclasses for domain errors                | Raw `@my-noodles/api-lib/exceptions` + `ExceptionsFilter`                                                                     |
| Second Winston instance / Nest `Logger` in features              | Inject `APP_LOGGER` (bootstrap may import `appLogger`)                                                                        |
| Deep `../../infrastructure/…` cross-layer imports                | `@/infrastructure/…` (or `@/config`, `@/application/…`)                                                                       |
| Importing `*Module` from `foo.module` instead of barrel          | `@/…` folder — e.g. `LoggingModule` from `@/infrastructure/logging`                                                           |

---

## 16. Quick Sanity Checklist

Before declaring done:

- [ ] Controller is route-only; logic in service
- [ ] Input DTOs validated (global pipe + decorators)
- [ ] External calls go through injectable clients; errors handled in service
- [ ] Feature module registered in `AppModule`
- [ ] DB changes have `up` + `down` migrations
- [ ] New entities extend `TimestampEntity`; FKs use `onUpdate: 'CASCADE'`, no `onDelete: 'CASCADE'`
- [ ] `pnpm nx run api:validate` passes
- [ ] Swagger/OpenAPI still generates if DTOs/controllers changed
