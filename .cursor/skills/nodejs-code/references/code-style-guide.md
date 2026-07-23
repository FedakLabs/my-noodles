# Nodejs Code Style Guide

---

## Table of Contents

1. [Language & TypeScript](#1-language--typescript)
2. [File & Class Naming](#2-file--class-naming)
3. [Layered Architecture](#3-layered-architecture)
4. [NestJS Modules & DI](#4-nestjs-modules--di)
5. [HTTP & Controllers](#5-http--controllers)
6. [DTOs & Validation](#6-dtos--validation)
7. [Exceptions](#7-exceptions)
8. [OpenAPI Documentation](#8-openapi-documentation)
9. [TypeORM Entities](#9-typeorm-entities)
10. [Migrations](#10-migrations)
11. [External API Integration](#11-external-api-integration)
12. [Configuration](#12-configuration)
13. [Logging, Tracing, Observability](#13-logging-tracing-observability)
14. [Rate Limiting](#14-rate-limiting)
15. [Tests](#15-tests)
16. [Anti-Patterns](#16-anti-patterns)
17. [Quick Sanity Checklist](#17-quick-sanity-checklist)

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

**NestJS modules:** when importing a `*Module` (e.g. `TelegramModule`) from outside that folder, always use the module’s barrel — never `telegram.module`, etc.

```ts
// app.module.ts — feature modules via barrels
import { OrdersModule } from './application/orders';
import { prepareDataSource } from '@my-noodles/api-lib/persistence';

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
  - `<feature>.validators.ts` — domain enums + custom class-validator / Swagger property decorators when a feature needs them (e.g. `checkouts.validators.ts`)
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

| Use a **class**                                                                        | Use a **function**                                                                                     |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Services, controllers, modules, entities, DTOs, filters, interceptors                  | Pure stateless helpers with no lifecycle (e.g. `slugify`, `parseBoolean`, `createAppLogger`)           |
| Bootstrap/adapters that compose dependencies (e.g. Nest filter wiring)                 | Small transforms where FP is clearer (e.g. `formatCurrency`, array coercions in `utils/transformers/`) |
| External API clients (`ApiClient` subclasses in `@my-noodles/integration-api-clients`) | One-off validators reused across DTOs when a decorator factory is enough                               |

Keep **pure primitives** as functions in `@my-noodles/api-lib/utils` or `apps/api/src/utils/` when they have no state and no framework coupling.

### Barrel `index.ts`

Every **module folder** (feature in `application/`, subsystem in `infrastructure/`) should have an `index.ts` that re-exports its **public** symbols. Other code imports from the barrel, not from deep files — this scopes imports to the module and hides internal layout.

The barrel is the module’s contract: export Nest `*Module` classes, services/entities other features need, and bootstrap adapters (middleware, filters). Keep helpers used only inside the folder unexported.

```ts
// infrastructure/logging/index.ts — configures ambient logger (and app log metadata) as a side effect
import { configureAppLogger } from '@my-noodles/api-lib/logger';
configureAppLogger({ appName, appVersion, nodeEnv, otel });

// application/orders/index.ts
export * from './orders.module';
export * from './orders.service';
export * from './order.entity';
```

Consumers:

```ts
import { logger } from '@my-noodles/api-lib/logger';
import { OrdersModule } from '@/application/orders';
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

- Framework-agnostic `*Api` client classes live in `@my-noodles/integration-api-clients/<provider>` and extend `ApiClient` from `@my-noodles/api-lib/api-client`.
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

Document routes per [§8 OpenAPI Documentation](#8-openapi-documentation). Keep handlers thin. **No operation JSDoc by default** — method names + routes + return types are enough.

```ts
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(@Inject(ResourcesService) private readonly resourcesService: ResourcesService) {}

  @Get()
  async list(@Query() query: ListResourcesQueryDto): Promise<PaginatedResourcesDto> {
    return this.resourcesService.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Resource> {
    return this.resourcesService.getById(id);
  }
}
```

### Query / path / body

- **Query DTOs** for filters, pagination (`page`, `limit` required when paginating, max 100), `locale`.
- **Body DTOs** for POST/PATCH with class-validator decorators.
- **Path params**: simple `@Param('id')` or a small param DTO if multiple params need validation.

---

## 6. DTOs & Validation

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

### OpenAPI on DTOs

Schema docs, `@example`, and when `@ApiProperty` is required: [§8 OpenAPI Documentation](#8-openapi-documentation).

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

## 7. Exceptions

### Raw base + presets (`@my-noodles/api-lib/exceptions`)

Framework-agnostic — **not** Nest `HttpException` subclasses. Construct with an options object; HTTP body is always `{ status, code, message, payload }` via `toBody()`.

| Field      | Role                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `payload`  | Hand-managed, client-safe data included in `toBody()`                                                 |
| `internal` | Server-only raw/debug details — never in the HTTP body; feeds `attributes.error.raw` in manifest logs |

Presets: `BadRequestException`, `NotFoundException`, `ConflictException`, `TooManyRequestsException`, `ServiceUnavailableException`, `ServerSideException`, `ValidationException`.

### Domain exceptions

Live in `<feature>.exceptions.ts`. Extend the raw lib base / presets:

```ts
import { AppException, HttpStatus, NotFoundException } from '@my-noodles/api-lib/exceptions';

export class CheckoutNotFoundException extends NotFoundException {
  constructor(checkoutId: string) {
    super({
      code: 'checkout_not_found',
      message: 'Checkout not found',
      payload: { checkoutId },
    });
  }
}

export class CheckoutExpiredException extends AppException {
  constructor(checkoutId: string) {
    super({
      status: HttpStatus.CONFLICT,
      code: 'checkout_expired',
      message: 'Checkout expired',
      payload: { checkoutId },
    });
  }
}
```

Use the matching preset when sufficient: `BadRequestException`, `ConflictException`, `NotFoundException`, `TooManyRequestsException`. Put provider/upstream dumps in `internal`, not `payload`.

### Custom filter (Nest coupling lives here only)

`ExceptionsFilter` (`exceptions.filter.ts`) catches everything, maps Nest built-ins (ValidationPipe, route 404, throttler 429, …) and unknown errors into `AppException` (unknown → `ServerSideException` with original in `internal`), logs the wrapped exception, and replies via `httpAdapter.reply(toBody())`. Register globally in bootstrap / test apps — do **not** wrap domain exceptions in Nest `HttpException`.

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

- `console.log` / `console.error` in feature code — use the ambient `logger` from `@my-noodles/api-lib/logger`.
- Swallow errors with empty `catch {}` unless explicitly best-effort (document why).
- Extend Nest `HttpException` for domain errors — extend `@my-noodles/api-lib/exceptions` instead.

---

## 8. OpenAPI Documentation

How we document Nest HTTP APIs for Swagger / OpenAPI. Prefer **TypeScript types + validators**; use JSDoc and decorators only when they add information the plugin cannot infer.

Plugin: `introspectComments: true` in `apps/api/nest-cli.json`. Live spec: `/api/docs-json`. After public API changes, regenerate the storefront client (see skill workflow).

### Principle

| Layer                            | Source of truth                                                            |
| -------------------------------- | -------------------------------------------------------------------------- |
| Operation summary / description  | **Opt-in** method JSDoc — omit by default                                  |
| Success status + response schema | Nest HTTP defaults + method return type                                    |
| Field description / example      | Property JSDoc + `@example` when the field needs human text or a sample    |
| Tags, errors, uninferable schema | Swagger decorators (see [When to use decorators](#when-to-use-decorators)) |

Do not duplicate inferred metadata with `@ApiOperation` or success-response decorators.

### Controllers (operations)

**Default: no handler JSDoc.** Route + HTTP method + handler name + return type are enough for the spec and for readers.

Add a summary / `@remarks` **only** when the operation has non-obvious behavior that clients or maintainers would otherwise misread (e.g. side effects, dual-purpose endpoints, semantics not in the name). Do not write summaries that restate `list` / `getById` / `create`.

| Need                  | How                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Summary / description | Optional handler JSDoc — first line = summary, `@remarks …` = longer note; use sparingly      |
| Success schema        | Explicit return type (`Promise<Resource>`, `Promise<Resource[]>`, `Promise<ResourceListDto>`) |
| Success status        | Nest defaults (GET → 200, POST → 201) unless `@HttpCode` changes runtime behavior             |

```ts
@Post()
@ApiException(ResourceConflictException)
async create(@Body() body: CreateResourceDto): Promise<Resource> {
  return this.resourcesService.create(body);
}

@Get(':id')
@ApiException(ResourceNotFoundException)
async getById(@Param('id') id: string): Promise<Resource> {
  return this.resourcesService.getById(id);
}

/**
 * Merge cart into an existing in-progress checkout when one is already open.
 *
 * @remarks Creates a new checkout only when the visitor has no active hold.
 */
@Post()
async startCheckout(...): Promise<Checkout> { ... }
```

Class-level grouping:

```ts
@ApiTags('Resources')
@Controller('resources')
export class ResourcesController { ... }
```

### DTOs & entities (schemas)

Prefer `class-validator` on inputs. Add property JSDoc when a field needs a human description or `@example` — not on every property by habit.

| Need                     | How                                                                              |
| ------------------------ | -------------------------------------------------------------------------------- |
| Field description        | First line(s) of the property JSDoc (when useful)                                |
| Example value            | `@example …` on that property (when useful)                                      |
| Type / required / format | TypeScript + validators (`@IsUUID`, `@IsDateString`, `@IsEnum`, …) when possible |

```ts
export class CreateResourceDto {
  /**
   * Owning account id
   * @example 00000000-0000-4000-8000-000000000001
   */
  @IsUUID()
  accountId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
}
```

Nest-facing DTO classes must live in files matched by OpenAPI generation conventions — prefer `*.dto.ts`.

### When to use decorators

Use Swagger decorators only for metadata the plugin cannot (or should not) infer from types / validators / (optional) JSDoc.

| Need                                                    | Decorator                                                                                                                                                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tag / group in Swagger UI                               | `@ApiTags('Resources')`                                                                                                                                                                                            |
| Documented error responses                              | `@ApiException(...)` (preferred); `@ApiNotFoundResponse` etc. only when there is no typed exception yet                                                                                                            |
| Enum schema name                                        | `@ApiProperty({ enum: Status, enumName: 'ResourceStatus' })`                                                                                                                                                       |
| Nullable unions                                         | `@ApiProperty({ type: String, nullable: true })` for `string \| null` — unions collapse to `Object` under `emitDecoratorMetadata`                                                                                  |
| Localized JSONB columns on API entities                 | `@ApiHideProperty()` + `@LocalizedColumn()` on `*Locale` storage props + `@LocalizedResolved()` getters (`name` etc.) from `@my-noodles/api-lib/nest` (`@ApiHideProperty` must be explicit for the Swagger plugin) |
| Format without a matching validator                     | `@ApiProperty({ format: 'uuid' })` / `date-time` when validators alone do not emit it                                                                                                                              |
| Mapped / intersection DTOs that drop fields             | Explicit `@ApiProperty` / `@ApiPropertyOptional` on the resulting shape                                                                                                                                            |
| Non-default success status that must appear in the spec | `@HttpCode(...)` for runtime; add `@ApiOkResponse` / `@ApiCreatedResponse` only if you must document a divergence from Nest defaults                                                                               |

When a field already has useful JSDoc, do not also put `description` / `example` on `@ApiProperty` unless you must override the plugin.

### Do not

- Handler JSDoc that only restates the method name or route (`/** List products */` on `list()`)
- `@ApiOperation({ summary })` — if a summary is warranted, use opt-in handler JSDoc instead
- `@ApiOkResponse` / `@ApiCreatedResponse` on the happy path — use return types + Nest status defaults
- `@ApiProperty({ description, example })` when JSDoc already covers it
- Omitting return types on controllers (plugin needs them for response schemas)

### End-to-end example

```ts
// resources.controller.ts
@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(@Inject(ResourcesService) private readonly resourcesService: ResourcesService) {}

  @Get()
  async list(@Query() query: ListResourcesQueryDto): Promise<PaginatedResourcesDto> {
    return this.resourcesService.list(query);
  }

  @Post()
  @ApiException(ResourceConflictException)
  async create(@Body() body: CreateResourceDto): Promise<Resource> {
    return this.resourcesService.create(body);
  }
}
```

```ts
// resources.dto.ts
export class CreateResourceDto {
  /**
   * Stable business key
   * @example resource-alpha
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  key!: string;

  /**
   * Optional note; omitted when unset
   * @example Ready for review
   */
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  note!: string | null;
}
```

---

## 9. TypeORM Entities

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

## 10. Migrations

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

## 11. External API Integration

### Base class (`@my-noodles/api-lib/api-client`)

Hand-written outbound clients extend **`ApiClient`**: fetch + OTEL spans + structured outgoing HTTP logs. Subclasses implement `getBaseUrl()`; call `this.get<T>()` / `this.post<T>()` for requests.

```ts
export abstract class ApiClient {
  // uses ambient `logger` from `@my-noodles/api-lib/logger` — no constructor injection
  protected abstract getBaseUrl(): string;

  protected get<T>(params: ApiClientRequestConfig): Promise<T> {
    /* … */
  }
  protected post<T>(params: ApiClientRequestConfig): Promise<T> {
    /* … */
  }
}
```

### Provider clients (`@my-noodles/integration-api-clients/<provider>`)

Framework-agnostic HTTP client classes live in **`packages/integration-api-clients`**. Nest registers them via `useFactory` in `apps/api` (`application/<provider>/`).

```ts
// packages/integration-api-clients/src/meest/meest.api.ts
export class MeestApi extends ApiClient {
  constructor(private readonly settings: MeestClientOptions) {
    super();
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
    useFactory: () => new MeestApi({ apiBaseUrl: meestConfig.apiBaseUrl }),
  },
  MeestService,
],
```

### OpenAPI-generated third-party clients

When this API must call **another service’s HTTP API**, prefer adding the raw client under **`packages/integration-api-clients/<provider>/`**. Generate from the upstream spec with **`@hey-api/openapi-ts`** when a spec exists; otherwise hand-write an `ApiClient` subclass. Nest wiring lives in `application/<provider>/` like any other feature module:

```text
packages/integration-api-clients/<provider>/
├── <provider>.api.ts      # *Api extends ApiClient; raw upstream calls
└── index.ts

apps/api/src/application/<provider>/
├── <provider>.config.ts
├── <provider>.service.ts  # optional — mapping/formatting when needed
├── <provider>.module.ts   # useFactory + exports *Service
└── index.ts
```

- **`*Api`** — framework-agnostic: options only, `ApiClient` subclass (ambient logger), upstream-shaped methods.
- **`*Service` (optional)** — Nest provider in `apps/api`; injects `*Api`; exposes domain-friendly methods to feature modules/adapters.
- Storefront OpenAPI client for the web app lives in **`packages/api-clients/storefront`** (`@hey-api/client-fetch`) — keep backend provider clients out of that package.

### Rules

- No business logic beyond request shaping and domain exception mapping.
- Secrets (API tokens, passwords, private keys) in env via `<feature>.config.ts` — not in source. Non-sensitive constants (public API base URLs, notification template IDs, example recipient emails safe to commit) may be hardcoded.
- Map `ApiClientException.httpStatus` to domain exceptions at the service boundary when needed.

---

## 12. Configuration

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

## 13. Logging, Tracing, Observability

- OTEL loads **before** the app via Node preload: `node --import=./dist/instrumentation.js dist/index.js`.
- `instrumentation.ts` is a side-effect module — no init/shutdown helpers in `index.ts` or graceful shutdown.
- **OTLP export**: opt-in via `OTEL_ENABLED`; no-op preload when off (local dev unaffected).
- **Logging**: ambient Winston singleton `logger` from `@my-noodles/api-lib/logger`. Configured once at startup via `configureAppLogger(...)` in `apps/api/src/infrastructure/logging` (also sets `LogMetadata` — `appName`/`appVersion`). Register `LoggingInterceptor` in bootstrap with `app.useGlobalInterceptors(...)`.
- Use the same `logger` everywhere — bootstrap, services, cron, Nest filters/interceptors, and non-DI utilities.

```ts
import { logger } from '@my-noodles/api-lib/logger';

logger.info({ msg: 'order.created', orderId, totalMinor });
logger.error({ msg: 'order.notify.failed', orderId, error: err.message });
```

Do not use Nest `new Logger()` or a second Winston instance — import the ambient `logger`.

Do not import OTel SDK directly in feature modules — use bootstrap instrumentation + logger correlation.

---

## 14. Rate Limiting

Global `@nestjs/throttler` (~60 req/min per IP) + tighter limit on sensitive routes:

```ts
@Post()
@Throttle({ default: { limit: 5, ttl: 60_000 } })
async create(@Body() dto: CreateOrderDto) { ... }
```

On limit exceeded, Nest returns 429 — `ExceptionsFilter` maps it to `TooManyRequestsException` (`code: 'too_many_requests'`).

---

## 15. Tests

- Naming: `<feature>.test.ts`, co-located.
- **Unit**: `@nestjs/testing` `Test.createTestingModule` with mocked providers/repos.
- **E2E**: supertest against bootstrapped app; `POST /api/orders`, `GET /api/products`, etc.
- Jest `testMatch` includes `**/*.test.ts`.

Cover: happy path, validation 400, not-found 404, external client failure behavior, throttling where relevant.

Run: `pnpm nx run api:test` or `api:validate`.

---

## 16. Anti-Patterns

| Anti-pattern                                                     | Do instead                                                                                                                                |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Business logic in controller                                     | Move to service                                                                                                                           |
| `@InjectRepository` in controller                                | Service only                                                                                                                              |
| `createQueryBuilder` with raw column strings for simple filters  | `find` / `count` + `FindOptionsWhere` + `In`, `Between`, …                                                                                |
| Raw `fetch`/`axios` in controller/service without a client class | `ApiClient` subclass (`*Api`) in `@my-noodles/integration-api-clients/<provider>`; Nest `*Service`/`*Module` in `application/<provider>/` |
| Response DTO that mirrors the entity one-to-one                  | Return entity (or pick columns); DTO only when shape genuinely differs                                                                    |
| DTO field without class-validator                                | Add validators                                                                                                                            |
| Schema change without migration                                  | Generate migration; keep `synchronize: false`                                                                                             |
| `ON DELETE CASCADE` on FKs                                       | `onDelete: 'RESTRICT'` (+ `onUpdate: 'CASCADE'`)                                                                                          |
| Entity without `created_at` / `updated_at` / `deleted_at`        | Extend `TimestampEntity`                                                                                                                  |
| Hard `repository.delete()` on catalog rows                       | `softRemove` / `softDelete` unless explicitly required                                                                                    |
| Hardcoded secrets/URLs                                           | `config.ts` + env                                                                                                                         |
| Disabling OTEL hooks in bootstrap                                | Keep instrumentation; gate export with `OTEL_ENABLED`                                                                                     |
| `console.log` for diagnostics                                    | Nest `Logger` / Winston                                                                                                                   |
| God `AppModule` providers                                        | Feature `*.module.ts` per domain                                                                                                          |
| Copy-paste validator                                             | Add to `utils/validators/` and reuse                                                                                                      |
| Nest `HttpException` subclasses for domain errors                | Raw `@my-noodles/api-lib/exceptions` + `ExceptionsFilter`                                                                                 |
| Second Winston instance / Nest `Logger` in features              | Import ambient `logger` from `@my-noodles/api-lib/logger`                                                                                 |
| Deep `../../infrastructure/…` cross-layer imports                | `@/infrastructure/…` (or `@/config`, `@/application/…`)                                                                                   |
| Importing `*Module` from `foo.module` instead of barrel          | `@/…` folder barrel — e.g. `TelegramModule` from `@/application/telegram`                                                                 |
| Handler JSDoc that restates the method/route                     | Omit; add summary/`@remarks` only for non-obvious operation semantics                                                                     |

---

## 17. Quick Sanity Checklist

Before declaring done:

- [ ] Controller is route-only; logic in service
- [ ] Input DTOs validated (global pipe + decorators)
- [ ] External calls go through injectable clients; errors handled in service
- [ ] Feature module registered in `AppModule`
- [ ] DB changes have `up` + `down` migrations
- [ ] New entities extend `TimestampEntity`; FKs use `onUpdate: 'CASCADE'`, no `onDelete: 'CASCADE'`
- [ ] `pnpm nx run api:validate` passes
- [ ] OpenAPI still generates from types/validators ([§8](#8-openapi-documentation)); no filler handler JSDoc
