# Nodejs Code Common Patterns

---

## Table of Contents

1. [Adding an endpoint](#1-adding-an-endpoint)
2. [New feature module](#2-new-feature-module)
3. [Entity + migration](#3-entity--migration)
4. [External API integration](#4-external-api-integration)
5. [Transactions (multi-entity writes)](#5-transactions-multi-entity-writes)
6. [Validators & pipes](#6-validators--pipes)
7. [Error handling (`catchIf` / `withErrorGate`)](#7-error-handling-catchif--witherrorgate)
8. [Tests](#8-tests)

---

## 1. Adding an endpoint

**Example:** `GET /api/products/:slug`

| File                     | Change                                     |
| ------------------------ | ------------------------------------------ |
| `products.dto.ts`        | `ProductDetailQueryDto` (`locale`)         |
| `products.controller.ts` | `@Get(':slug')`                            |
| `products.service.ts`    | `getBySlug()` + localized JSONB resolution |
| `products.exceptions.ts` | `ProductNotFoundException`                 |
| `products.test.ts`       | unit + supertest                           |

```ts
@Get(':slug')
async getBySlug(@Param('slug') slug: string): Promise<ProductDetailDto> {
  return this.productsService.getBySlug(slug);
}
```

---

## 2. New feature module

```text
application/products/
├── products.module.ts
├── products.controller.ts
├── products.service.ts
├── product.entity.ts
├── products.dto.ts
├── products.exceptions.ts
├── products.validators.ts   # optional — domain enums + custom validators
├── index.ts
└── products.test.ts
```

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

Import integration modules from their **barrel** (`@/application/products` or `@/application/telegram`) — not deep paths like `@/application/products.module`.

Register feature modules in `AppModule.imports` from each domain barrel (`./application/products`), not `products.module`.

**Sub-features:** nest under the parent domain when scope is small (`application/products/` with `GET /products/filters` on the products controller); split into its own module only when it has distinct lifecycle or many files. Match what the repo already does — grep before inventing a new layout.

### Service data-access hierarchy

Give a new entity service `get(where)` and `getAll(where)` methods as its default read path:

```ts
private async get(where: FindOptionsWhere<Entity>): Promise<Entity> {
  const entity = await this.repository.findOne({ where });
  if (!entity) {
    throw new EntityNotFoundException();
  }
  return entity;
}

private getAll(where: FindOptionsWhere<Entity>): Promise<Entity[]> {
  return this.repository.find({ where });
}
```

Keep not-found handling and any enrichment required for a complete domain aggregate inside `get()`,
so callers do not repeat them. `getAll()` should apply the corresponding collection enrichment when
needed.

Choose the simplest sufficient access level:

1. **`get()` / `getAll()`** — normal entity reads, aggregate loading, enrichment, and not-found behavior.
2. **Repository API** — expected absence, conditional writes, specialized ordering, or repository operations
   not represented by the base methods.
3. **Query builder API** — complex joins, projections, aggregates, locking, or performance-sensitive queries.

### TypeORM query behavior

- In data source `invalidWhereValuesBehavior` set to ignore `null` / `undefined` in `where` clauses
  (`libs/api` `prepareDataSource`), so optional filters like `where: { name: string | undefined }`
  are fine when `status` is `undefined`. TypeORM's default is `throw`; we opt out for call-site
  ergonomics. Trade-off: a forgotten required filter that is accidentally `undefined` is silently
  dropped and can widen the result set — do not treat ignored properties as intentional SQL `NULL`.
- Use `IsNull()` when matching SQL `NULL`. Bare `null` is ignored under our config.
- Soft-delete is automatic: do not add `deletedAt: IsNull()` to repository `find` / `findOne` /
  `update` / `softDelete` criteria. Use `withDeleted: true` only when deleted records are
  intentionally required.

---

## 4. External API integration

**Client layer** — framework-agnostic HTTP clients live in `@my-noodles/integration-api-clients/*` and extend `ApiClient`. Nest wiring lives under `application/*` like any other feature module:

```text
packages/integration-api-clients/*
├── *.api.ts         # *Api extends ApiClient; raw upstream calls
└── index.ts

apps/api/src/application/*
├── *.config.ts      # env → base URL, auth
├── *.service.ts     # optional *Service — mapping/formatting
├── *.module.ts      # useFactory registration; exports *Service
└── index.ts
```

Example: `TelegramApi` in `@my-noodles/integration-api-clients/telegram` + `TelegramService` / `TelegramModule` in `application/telegram/`.

Setup checklist:

1. **Client** — extend `ApiClient` in `packages/integration-api-clients`; accept options only (logger is ambient on `ApiClient`); expose upstream-shaped methods (no business orchestration).
2. **Config** — secrets and base URL from env in `<provider>.config.ts` (see [code-style-guide § External API](./code-style-guide.md#10-external-api-integration)).
3. **Service (optional)** — Nest provider; inject `*Api`; add formatting/mapping when adapters or feature services need a friendlier surface.
4. **Module** — `useFactory` to construct `*Api` with validated config; import in the feature module that orchestrates the flow.
5. **Feature service** — call the service (or api) after the primary persistence path; **catch and log** outbound failures when the user-facing operation must still succeed (e.g. notification after order save). Prefer `catchIf` for expected errors (see [§7](#7-error-handling-catchif--witherrorgate)).

---

## 5. Transactions (multi-entity writes)

Use the transaction infrastructure from `@my-noodles/api-lib/nest` when several database operations
must succeed or fail as one unit.

**Module wiring** — register every entity used inside the transaction with
`TransactionalTypeOrmModule.forFeature()`, not `TypeOrmModule.forFeature()`:

```ts
import { TransactionalTypeOrmModule } from '@my-noodles/api-lib/nest';

@Module({
  imports: [TransactionalTypeOrmModule.forFeature([Checkout, Order, OrderItem])],
  providers: [CheckoutsService],
})
export class CheckoutsModule {}
```

This module provides context-aware repositories through the standard `@InjectRepository()` token.
Outside a transaction they use the default `DataSource` manager; inside `withTransaction()` they
automatically resolve against its transaction manager.

**Service wiring** — extend `TransactionalRepository`, inject the `DataSource`, and pass it to
`super()`:

```ts
import { TransactionalRepository } from '@my-noodles/api-lib/nest';

@Injectable()
export class CheckoutsService extends TransactionalRepository {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(Checkout)
    private readonly checkoutsRepository: Repository<Checkout>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {
    super(dataSource);
  }
}
```

**Usage** — keep all atomic database work inside one awaited callback. Continue using the injected
repositories normally; do not manually pass an `EntityManager` or obtain transaction-specific
repositories:

```ts
return this.withTransaction(async () => {
  const order = this.ordersRepository.create({
    visitorSessionId,
    status: OrderStatus.Draft,
  });
  const savedOrder = await this.ordersRepository.save(order);

  const checkout = this.checkoutsRepository.create({
    orderId: savedOrder.id,
    visitorSessionId,
    status: CheckoutStatus.Active,
  });
  return this.checkoutsRepository.save(checkout);
});
```

An exception rejects the callback and rolls back all its writes. Nested `withTransaction()` calls
reuse the active transaction instead of opening another one, so transactional service methods can
safely call each other. Keep external side effects that cannot roll back (notifications or upstream
API calls) outside the transaction unless their failure must abort the database work.

### Creating entities

Always instantiate a new entity with `repository.create()` before passing it to `repository.save()`:

```ts
const checkout = checkoutRepository.create({
  orderId: order.id,
  visitorSessionId,
  status: CheckoutStatus.Active,
});

await checkoutRepository.save(checkout);
```

Do not pass a raw object directly to `save()`. Entity listeners and lifecycle decorators such as
`@BeforeInsert` / `@AfterInsert` are bound to entity class instances and may not run for plain objects.
Using `create()` also applies TypeORM entity construction consistently before persistence.

---

## 6. Validators & pipes

### Feature validators (`<feature>.validators.ts`)

When a feature needs shared domain enums or reusable property decorators (class-validator + `@ApiProperty` / `enumName` for OpenAPI), put them in `<feature>.validators.ts` next to the DTOs — e.g. `checkouts.validators.ts` with `CheckoutStatus` and `IsCheckoutStatus()`. Keep ordinary per-field validators (`@IsString()`, `@IsUUID()`, …) on the DTO classes; use this file only when the decorator or enum is reused across DTOs/entities/services.

### Pagination (`src/utils/pagination.ts`)

Shared query + response shape for all paginated list endpoints

**Query** — extend `PaginationQueryDto` on list query DTOs:

```ts
import { PaginationQueryDto } from '@/utils/pagination';

export class ListProductsQueryDto extends PaginationQueryDto {
  // filters only — page/limit inherited
}
```

**Response** — extend `PaginatedMetaDto` and add `items`:

```ts
import { PaginatedMetaDto } from '@/utils/pagination';

export class PaginatedProductsDto extends PaginatedMetaDto {
  items!: ProductSummaryDto[];
}
```

JSON shape:

```json
{
  "items": [/* ... */],
  "meta": { "total": 42, "currentTotal": 20, "page": 1, "limit": 20 }
}
```

**Service** — use `PaginationHelper` (query builder + skip/take + meta):

```ts
import { PaginationHelper } from '@/utils/pagination';

const { items: rows, meta } = await PaginationHelper.paginate(repo, filters);

return { items: rows.map(toDto), meta };
```

For joins or custom QB tweaks, use `new PaginationHelper(repo, pagination).execute(options, { addToQueryBuilder })`.

`buildPaginationMeta` / `paginationSkip` remain available for non-standard flows.

---

## 7. Error handling (`catchIf` / `withErrorGate`)

Shared helpers live in `@my-noodles/api-lib/utils` (`libs/api/src/utils/error.ts`). Prefer them over ad-hoc `try/catch` for most “expected vs unexpected” cases.

**Ambient logger** — import `logger` from `@my-noodles/api-lib/logger` anywhere (services, cron, utils, bootstrap). Do not inject a Nest logger token.

### `catchIf` — preferred for inline `.catch(...)`

Match by exception class, identifier string, or `customMatch`, then either return a fallback value or run a handler. Unmatched errors are rethrown.

```ts
import { catchIf } from '@my-noodles/api-lib/utils';

// Fallback value when a known exception is thrown
const checkout = await this.getCheckout(id, visitorId).catch(
  catchIf({ classes: [CheckoutNotFoundException] }, null),
);

// Transform / rethrow a known upstream error
await upstream.call().catch(
  catchIf({ classes: [ApiClientException] }, (error) => {
    throw new DeliveryUnavailableException(error.message);
  }),
);

// Identifier-based match (error.identifier or error.body.identifier)
await job.run().catch(catchIf({ identifiers: ['inventory_changed'] }, undefined));
```

Use `customMatch` when class/identifier checks are not enough:

```ts
await op().catch(catchIf({ customMatch: (error) => error?.status === 404 }, null));
```

### `withErrorGate` — wrap an operation with an allow-list

Forwards whitelisted errors (after logging) and forces everything else through `onUnhandledError` (which must rethrow).

```ts
import { withErrorGate } from '@my-noodles/api-lib/utils';

return withErrorGate(() => this.inventoryService.deductOnSubmit(lines), {
  errorLogId: 'checkouts.submit',
  whitelistedErrors: { classes: [OrderInventoryChangedException] },
  onUnhandledError: (error) => {
    throw new ServerSideException('inventory deduct failed', { cause: error });
  },
});
```

**Rule of thumb:** reach for `catchIf` first on promise chains; use `withErrorGate` when you need a single gate around a block with an explicit allow-list + mandatory remapping of surprises.

---

## 8. Tests

**Unit** — mock repository and outbound clients:

```ts
const module = await Test.createTestingModule({
  providers: [
    OrdersService,
    { provide: getRepositoryToken(Order), useValue: orderRepo },
    { provide: AcmeNotificationService, useValue: { notifyOrderCreated: jest.fn() } },
  ],
}).compile();
```

**E2E** — supertest with global prefix `api`:

```ts
await request(app.getHttpServer()).post('/api/orders').send(payload).expect(201);
```

Cover: validation 400, not-found 404, outbound integration failure tolerance where applicable.

```bash
pnpm nx run api:test
pnpm nx run api:validate
```
