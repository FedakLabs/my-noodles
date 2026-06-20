# Backend Code Style Guide (NestJS + TypeORM)

Conventions for TypeScript in `apps/api`. When unsure, grep the nearest analogous module and match its shape.

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

- `apps/api` is **CommonJS** (`"module": "CommonJS"` in tsconfig, no `"type": "module"` in `package.json`).
- **No file extensions** in import paths — use `@/config`, `./orders.service`, `@/infrastructure/persistence`.
- Barrel folders resolve via `index.ts` automatically — import the folder, not `/index` (e.g. `@/infrastructure/logging`, not `…/logging/index`).
- Prefer `import type` for type-only imports.
- Use `__dirname` for paths relative to the current module (e.g. `config.ts` root for entity/migration globs).
- **ESM deferred** until NestJS v12+ native support — do not reintroduce `"type": "module"` or `.js` import suffixes without an explicit migration plan.

### Strictness

- Monorepo base enables `strict: true`, `noUncheckedIndexedAccess`, etc. No `any` without a comment justifying it.
- Prefer `unknown` + narrowing over `any`.
- Avoid `!` non-null assertions unless the value was just validated or loaded from a required DB column.
- Use `readonly` on constructor-injected dependencies.

### Decorators

- NestJS, TypeORM, class-validator, and Swagger all use decorators — keep `emitDecoratorMetadata` enabled in tsconfig.
- Follow decorator order used in neighbouring controllers (route decorators before param decorators).

### Path aliases (`@/*`)

Configured in `apps/api/tsconfig.json`: `@/*` → `src/*` (same idea as `apps/web`).

| Import from | Use |
| ----------- | --- |
| Same feature folder (internal) | Relative — `./orders.service`, `./order.entity` |
| Sibling feature in `application/` (same layer) | Relative — `../products/product.entity` |
| Another module’s **public API** (cross-layer or cross-feature) | Barrel — `@/infrastructure/logging`, `@/application/orders` |
| Single-file top-level modules | `@/config`, `@/configs/api`, `@/env` |

**Do not** reach into another module’s internal files when that module exposes a barrel — import the folder so the module boundary stays explicit and refactors stay local.

**NestJS modules:** when importing a `*Module` (or bootstrap helpers such as `createWinstonModuleOptions`, `LoggingModule`, `TelegramModule`) from outside that folder, always use the module’s barrel — never `logging.module`, `telegram.module`, etc.

```ts
// app.module.ts — feature + infra modules via barrels
import { OrdersModule } from './application/orders';
import { createWinstonModuleOptions, LoggingModule } from './infrastructure/logging';
import { prepareDataSource } from './infrastructure/persistence';

// application/orders/orders.module.ts — optional integration module via barrel
import { TelegramModule } from '@/infrastructure/services/Telegram';

// application/orders/orders.module.ts — internals stay relative
import { Product } from '../products/product.entity';
import { OrdersService } from './orders.service';
```

**Tooling:** `api:serve` runs `scripts/dev.cjs` (`tsc -w` + `tsc-alias` + `node dist/`). Use `tsx` only for one-off scripts (migrations, seed). Jest: `jest.config.cjs` + `ts-jest`. Production: `tsc` + `tsc-alias` (see `apps/api/project.json`).

**Import order** (simple-import-sort): externals → same-module / sibling relative → `@/` cross-layer.

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
- No separate authenticated controller variants unless the product adds auth.

### Barrel `index.ts`

Every **module folder** (feature in `application/`, subsystem in `infrastructure/`) should have an `index.ts` that re-exports its **public** symbols. Other code imports from the barrel, not from deep files — this scopes imports to the module and hides internal layout.

The barrel is the module’s contract: export Nest `*Module` classes, services/entities other features need, and bootstrap wiring (`createWinstonModuleOptions`, middleware, filters). Keep helpers used only inside the folder unexported.

```ts
// infrastructure/logging/index.ts
export { LoggingModule } from './logging.module';
export { createWinstonModuleOptions } from './winston';
export { clientBaggageMiddleware, ManifestHttpExceptionFilter } from './…';

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
import { LoggingModule, createWinstonModuleOptions } from '@/infrastructure/logging';
import { OrdersModule } from '@/application/orders';
import { TimestampEntity } from '@/infrastructure/persistence';
```

**Inside** the same module folder, keep relative imports to sibling files (`./orders.service.js`). **Outside** the module, use the barrel only — including `AppModule`, `index.ts` bootstrap, tests, seed scripts, and cross-feature services.

Nest runtime wiring still goes through `@Module({ imports: [...] })`; barrels are how other folders reference a module without knowing its file layout.

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

### Global setup (bootstrap)

- `app.setGlobalPrefix('api')` — routes are `/api/...`, no versioning.
- Global `ValidationPipe`: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`.
- Swagger at `/api/docs-json` via `@nestjs/swagger`.
- **OpenAPI CLI plugin** enabled in `tsconfig.build.json` ([NestJS docs](https://docs.nestjs.com/openapi/cli-plugin)): auto-generates `@ApiProperty` on `*.dto.ts` / `*.entity.ts` and wires `@Query()` / `@Body()` params on `*.controller.ts` at compile time. Do **not** duplicate query params in separate `*.openapi.ts` files.
- DTOs keep **class-validator** decorators for runtime validation; `@ApiProperty` is optional (plugin fills gaps). Override with explicit `@ApiProperty()` when you need custom examples or descriptions.
- `api:serve` must compile through `tsc` (not `tsx`) so the plugin transforms apply before Swagger boots.

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
  async getBySlug(@Param('slug') slug: string, @Query() query: LocaleQueryDto): Promise<ProductDetailDto> {
    return this.productsService.getBySlug(slug, query.locale);
  }
}
```

### Query / path / body

- **Query DTOs** for filters, pagination (`page`, `limit` required when paginating, max 100), `locale`.
- **Body DTOs** for POST/PATCH with class-validator decorators.
- **Path params**: simple `@Param('slug')` or a small param DTO if multiple params need validation.

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
  @MaxLength(30)
  phone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

### Swagger

Add `@ApiProperty()` / `@ApiPropertyOptional()` only when overriding plugin defaults (examples, descriptions). Prefer `class-validator` decorators on DTO fields — the CLI plugin mirrors them when `classValidatorShim: true`.

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

| Prefer UUID (`uuid`) | Prefer incremental (`increment` / `bigint`) |
| --- | --- |
| IDs exposed in public APIs, URLs, or client-visible references (orders, products) | Internal-only rows (audit logs, job queues, join tables never surfaced) |
| Merge/replicate across environments without collision | High-volume append-only tables where sequential scan locality matters |
| Opaque, non-guessable identifiers for security-sensitive resources | Admin-only tables where numeric IDs are acceptable |

```ts
// Public-facing resource
@PrimaryGeneratedColumn('uuid')
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
  @PrimaryGeneratedColumn('uuid')
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

### Relations & foreign keys

- Explicit inverse sides; avoid eager loading unless every caller needs it.
- **Every FK**: `onUpdate: 'CASCADE'` — keeps referential integrity when a parent PK changes.
- **Never** `onDelete: 'CASCADE'` — avoids silent cascade wipes; use `onDelete: 'RESTRICT'` on all FKs (including optional ones such as `products.brand_id` — detach or reassign in app code before deleting a brand).
- TypeORM `cascade: true` on `@OneToMany` / `@OneToOne` is **persist cascade** (save/load), not a DB `ON DELETE CASCADE` — use sparingly and only when children are always saved with the parent in the same transaction.
- `@JoinTable` join / inverse join columns: set `onUpdate: 'CASCADE'` and `onDelete: 'RESTRICT'` on both sides in the **migration** (TypeORM `@JoinTable` metadata may not expose FK actions — keep DB constraints explicit in SQL).

```ts
@ManyToOne(() => Country, (country) => country.products, {
  nullable: false,
  onUpdate: 'CASCADE',
  onDelete: 'RESTRICT',
})
@JoinColumn({ name: 'country_id' })
country!: Country;
```

### Repository queries

Prefer **type-safe** `Repository` APIs over `createQueryBuilder` string columns:

| Use | When |
| --- | --- |
| `find`, `findOne`, `findAndCount`, `count` | Listing, detail, filtered counts |
| `FindOptionsWhere<Entity>` + `In`, `Between`, `MoreThan`, … | Filters on entity + relation properties |
| `relations`, `order`, `skip`, `take`, `select` | Eager load, sort, pagination, partial rows |
| In-memory aggregation on a bounded filtered set | Facet counts / min–max when result sets stay small enough to load in one query |
| `createQueryBuilder` | Only when the above cannot express the query (e.g. complex SQL, window functions, bulk relation API in seed scripts) |

Centralize reusable filter/sort builders next to the feature (e.g. `buildProductWhere()` in `products.filters.ts`) — **entity property names**, not raw SQL column strings.

```ts
import { Between, In, MoreThan, type FindOptionsWhere } from 'typeorm';

export function buildProductWhere(filters: ProductFilters): FindOptionsWhere<Product> {
  const where: FindOptionsWhere<Product> = {};

  if (filters.category?.length) {
    where.category = { slug: In(filters.category) };
  }

  if (filters.inStock === true) {
    where.quantity = MoreThan(0);
  }

  return where;
}

const { items: rows, meta } = await PaginationHelper.paginate(this.productsRepository, filters, {
  where: buildProductWhere(filters),
  relations: { brand: true, country: true, category: true },
  order: { sortWeight: 'DESC', createdAt: 'DESC' },
});

return { items: rows.map(toSummary), meta };
```

**Do not** scatter `'product.price_minor'` / `'category.slug'` strings in services — renames will not be caught by TypeScript.

---

## 9. Migrations

- **Never** rely on `synchronize: true` — `prepareDataSource()` sets `synchronize: false` always.
- Migration classes in `src/infrastructure/migrations/*.ts` (CLI helpers live in `migrations/scripts/`).
- Implement **both** `up` and `down`.
- Test locally: `pnpm nx run api:migration:run` → `pnpm nx run api:migration:revert` → run again.
- **Initial schema:** one migration per domain scope, ordered by FK dependencies (e.g. `CreateCatalog` → `CreateOrders`). Later changes get their own timestamped migration files.
- Data migrations: idempotent SQL (`ON CONFLICT DO NOTHING`, guarded `WHERE` clauses). Skip legacy backfills when the project has no production data yet.

### SQL style

- One `queryRunner.query(\`...\`)` per logical step; use `--` comments inside SQL to label sections.
- **Unquoted lowercase** identifiers for tables/columns (`products`, `created_at`) — PostgreSQL folds them consistently.
- Column layout: align types; put `created_at`, `updated_at`, `deleted_at` on every domain table.
- **String columns:** use `TEXT` in PostgreSQL (same performance as `VARCHAR(n)`; avoid arbitrary length caps in SQL).
- Name constraints explicitly: `{table}_pkey`, `{table}_{column}_key` (unique), `{child}_{parent}_fk` (foreign keys).
- **No DB defaults for business/content fields** (`currency`, `flavor`, `status`, `sort_order`, empty arrays, placeholder JSON). Seed scripts and application code must supply intentional values. DB defaults are only for infrastructure: `gen_random_uuid()`, timestamp columns (`now()`).
- **Foreign keys — default for every relationship:**

```sql
parent_id UUID NOT NULL
    CONSTRAINT child_parent_fk
        REFERENCES parent(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
```

| Situation | `ON DELETE` |
| --------- | ----------- |
| All FKs (required or optional) | `RESTRICT` — block parent delete while children reference it |
| Never | `CASCADE` — silent child deletes risk data loss |
| Never | `SET NULL` — hides broken references; reassign or soft-delete in app code instead |

**Why `ON UPDATE CASCADE` everywhere:** UUID PKs are effectively immutable, so this rarely fires; when a key *does* change, children stay consistent automatically. Cost is negligible; omitting it can surface surprise FK errors on rare updates.

**Why not `ON DELETE CASCADE`:** deleting a parent must be an explicit application decision (soft-delete via `deleted_at`, or delete children in code). DB-level cascade can orphan audit trails and order history.

- Indexes for FKs and sort columns: **partial** `WHERE deleted_at IS NULL` so soft-deleted rows stay out of hot paths.

```sql
CREATE INDEX idx_products_country_id ON products(country_id) WHERE deleted_at IS NULL;
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

### Base class (`infrastructure/external-api/`)

Hand-written outbound clients extend **`ExternalApi`**: axios + OTEL spans + structured outgoing HTTP logs. Subclasses implement `getBaseUrl()`; call `this.get<T>()` / `this.post<T>()` for requests.

```ts
export abstract class ExternalApi {
  protected constructor(protected readonly serviceName: string) {}

  protected abstract getBaseUrl(): string;

  protected get<T>(params: AxiosRequestConfig): Promise<T> { /* … */ }
  protected post<T>(params: AxiosRequestConfig): Promise<T> { /* … */ }
}
```

### Application integration service

Hand-written outbound integrations live in **`application/<integration>/`**: `<integration>.config.ts` (local env const), request/response types in `<integration>.dto.ts`, `@Injectable()` service extending `ExternalApi`.

```ts
@Injectable()
export class AcmeWebhookService extends ExternalApi {
  constructor(private readonly settings: AcmeWebhookConfig) {
    super(AcmeWebhookService.name);
  }

  protected getBaseUrl(): string {
    return acmeWebhookConfig.baseUrl;
  }

  async notifyOrderCreated(payload: AcmeOrderCreatedPayload): Promise<void> {
    await this.post<void>({ url: '/hooks/order-created', data: payload });
  }
}
```

Register via a small `*Module`; inject the service from feature services that orchestrate the flow.

### OpenAPI-generated third-party clients

When this API must call **another service’s HTTP API**, add a folder under **`infrastructure/services/<ServiceName>/`**:

```text
infrastructure/services/merchant-email/
├── generated/              # OpenAPI Generator output — read-only, regen from upstream spec
│   ├── api/                # *Api classes (EmailApi, …)
│   ├── models/             # request/response DTOs
│   ├── configuration.ts
│   └── index.ts
├── client/
│   ├── <service>.config.ts # basePath / auth from env
│   ├── <service>.client.ts # extends ExternalApi; wires generated *Api to this.axiosInstance
│   └── index.ts
└── index.ts                # public barrel — export client + typed models consumers need
```

```ts
// client/acme.client.ts — pattern: generated API + shared axios from ExternalApi
@Injectable()
export class AcmeApiClient extends ExternalApi {
  readonly ordersApi: OrdersApi;

  constructor() {
    super(AcmeApiClient.name);
    this.ordersApi = new OrdersApi(new Configuration(), undefined, this.axiosInstance);
  }

  protected getBaseUrl(): string {
    return acmeServiceConfig.basePath;
  }
}
```

- **`generated/`** — never hand-edit; regenerate when the upstream OpenAPI spec changes.
- **`client/`** — thin Nest provider: config, `ExternalApi` subclass, domain-friendly methods if needed.
- Distinct from **`packages/api-clients`** — that package is **our** storefront client for the web app, not inbound third-party integrations.

### Rules

- No business logic beyond request shaping and domain exception mapping.
- Secrets (API tokens, passwords, private keys) in env via `<feature>.config.ts` — not in source. Non-sensitive constants (public API base URLs, notification template IDs, example recipient emails safe to commit) may be hardcoded.
- Map `ExternalApiException.httpStatus` to domain exceptions at the service boundary when needed.

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

// otel-instrumentation.ts — side-effect preload; started via `node --import=./dist/otel-instrumentation.js`
if (config.otel.enabled) {
  const sdk = new NodeSDK({ /* ... */ });
  sdk.start();
}
```

- Optional integration config lives in `application/<feature>/<feature>.config.ts` — not on root `Config`.

---

## 12. Logging, Tracing, Observability

- OTEL loads **before** the app via Node preload: `node --import=./dist/otel-instrumentation.js dist/index.js` (see `package.json` `start` and `scripts/dev.cjs`).
- `otel-instrumentation.ts` is a side-effect module — no init/shutdown helpers in `index.ts` or graceful shutdown.
- **OTLP export**: opt-in via `OTEL_ENABLED`; no-op preload when off (local dev unaffected).
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

Run: `pnpm nx run api:test` or `api:fix`.

---

## 15. Code Formatting

- Root Prettier: 2 spaces, single quotes, semicolons, `trailingComma: all`, printWidth ~110.
- Import order (simple-import-sort via ESLint):
  1. External packages (`@nestjs/*`, `typeorm`, `class-validator`, …)
  2. Same-module / sibling-feature relative imports (`./`, `../products/…`)
  3. Cross-layer aliases (`@/infrastructure/…`, `@/application/…`, `@/config`, …)
- Path aliases — see [§ Path aliases](#path-aliases-).
- ESLint: node/nest preset from `configs/eslint` — no inline disables without justification.

---

## 16. Anti-Patterns

| Anti-pattern                                                     | Do instead                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| Business logic in controller                                     | Move to service                                       |
| `@InjectRepository` in controller                                | Service only                                          |
| `createQueryBuilder` with raw column strings for simple filters  | `find` / `count` + `FindOptionsWhere` + `In`, `Between`, … |
| Raw `fetch`/`axios` in controller/service without a client class | `ExternalApi` subclass in `application/<integration>/` or `infrastructure/services/<service>/client/` |
| Response DTO that mirrors the entity one-to-one                   | Return entity (or pick columns); DTO only when shape genuinely differs |
| DTO field without class-validator                                | Add validators                                        |
| Schema change without migration                                  | Generate migration; keep `synchronize: false`         |
| `ON DELETE CASCADE` on FKs                                       | `onDelete: 'RESTRICT'` (+ `onUpdate: 'CASCADE'`)      |
| Entity without `created_at` / `updated_at` / `deleted_at`        | Extend `TimestampEntity`                              |
| Hard `repository.delete()` on catalog rows                       | `softRemove` / `softDelete` unless explicitly required |
| Hardcoded secrets/URLs                                           | `config.ts` + env                                     |
| Disabling OTEL hooks in bootstrap                                | Keep instrumentation; gate export with `OTEL_ENABLED` |
| `console.log` for diagnostics                                    | Nest `Logger` / Winston                               |
| God `AppModule` providers                                        | Feature `*.module.ts` per domain                      |
| Copy-paste validator                                             | Add to `utils/validators/` and reuse                  |
| Deep `../../infrastructure/…` cross-layer imports              | `@/infrastructure/…` (or `@/config`, `@/application/…`) |
| Importing `*Module` from `foo.module` instead of barrel          | `@/…` folder — e.g. `LoggingModule` from `@/infrastructure/logging` |

---

## 17. Quick Sanity Checklist

Before declaring done:

- [ ] Controller is route-only; logic in service
- [ ] Input DTOs validated (global pipe + decorators)
- [ ] External calls go through injectable clients; errors handled in service
- [ ] Feature module registered in `AppModule`
- [ ] DB changes have `up` + `down` migrations
- [ ] New entities extend `TimestampEntity`; FKs use `onUpdate: 'CASCADE'`, no `onDelete: 'CASCADE'`
- [ ] `pnpm nx run api:fix` passes
- [ ] Swagger/OpenAPI still generates if DTOs/controllers changed
