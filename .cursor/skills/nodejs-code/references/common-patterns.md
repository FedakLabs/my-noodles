# Common Patterns — Backend (NestJS + TypeORM)

Recipes for `apps/api`. **Grep the repo first** — use domain names from this project (products, collections, orders), not generic CRUD scaffolds from other codebases.

> Read [code-style-guide.md](./code-style-guide.md). Architecture: `docs/mvp-plan.md`.

---

## Table of Contents

1. [Adding an endpoint](#1-adding-an-endpoint)
2. [New feature module](#2-new-feature-module)
3. [Entity + migration](#3-entity--migration)
4. [External API integration](#4-external-api-integration)
5. [Transactions (multi-entity writes)](#5-transactions-multi-entity-writes)
6. [Validators & pipes](#6-validators--pipes)
7. [Tests](#7-tests)

---

## 1. Adding an endpoint

**Example:** `GET /api/products/:slug`

| File                     | Change                                     |
| ------------------------ | ------------------------------------------ |
| `products.dto.ts`        | `ProductDetailQueryDto` (`locale`)         |
| `products.controller.ts` | `@Get(':slug')`                            |
| `products.service.ts`    | `getBySlug()` + localized JSONB resolution |
| `products.exceptions.ts` | `ProductNotFoundException`                 |
| `~products.test.ts`      | unit + supertest                           |

```ts
@Get(':slug')
async getBySlug(@Param('slug') slug: string): Promise<ProductDetailDto> {
  return this.productsService.getBySlug(slug);
}
```

---

## 2. New feature module

Domains in mvp-plan: **products** (incl. catalog filters preview), **collections**, **countries**, **brands**, **orders**.

```text
application/orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── order.entity.ts
├── order-item.entity.ts
├── orders.dto.ts
├── orders.exceptions.ts
├── index.ts
└── ~orders.test.ts
```

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), AcmeNotificationModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

Import integration modules from their **barrel** (`@/application/acme-notification` or `@/infrastructure/services/Acme`) — not deep paths like `acme.module`.

Register feature modules in `AppModule.imports` from each domain barrel (`./application/orders`), not `orders.module`.

**Sub-features:** nest under the parent domain when scope is small (`application/products/` with `GET /products/filters` on the products controller); split into its own module only when it has distinct lifecycle or many files. Match what the repo already does — grep before inventing a new layout.

**List/filter endpoints:** keep query-building out of the service body — e.g. `*.filters.ts` with `buildWhere` / `buildOrder` helpers; use `findAndCount` for paginated lists. See [code-style-guide § Repository queries](./code-style-guide.md#repository-queries).

---

## 3. Entity + migration

- Extend `TimestampEntity` (`infrastructure/persistence/timestamp.entity.ts`) — `created_at`, `updated_at`, `deleted_at` on every table.
- Use explicit column types and naming that match the domain (`status`, `slug`, monetary amounts in minor units + `currency`, etc.).
- FK relations: `onUpdate: 'CASCADE'`; `onDelete: 'RESTRICT'` on **all** FKs — **never** `onDelete: 'CASCADE'` or `SET NULL`.
- SQL migrations: see [code-style-guide.md § Migrations](./code-style-guide.md#9-migrations) — inline named FKs, partial indexes on `deleted_at IS NULL`.
- Initial schema: one migration per **domain scope** (`CreateCatalog`, then `CreateOrders`); add new timestamped files as changes arise.

> **Side note — localized strings:** user-facing copy stored in the DB uses JSONB `{ uk, en }` (e.g. `name`, `description`). Resolve to a single locale in the service/DTO layer — do not expose raw JSONB on public responses.

```bash
pnpm nx run api:migration:run
pnpm nx run api:migration:revert   # rolls back one migration
```

Both `up` and `down`. Test run → revert → run.

---

## 4. External API integration

Outbound HTTP from this API — **not** `packages/api-clients` (that package is the web app calling **our** API).

Two shapes; pick based on whether the upstream publishes OpenAPI:

**Hand-written** — simple REST, webhooks, bot APIs:

```text
application/<integration>/
├── <integration>.config.ts   # env → typed config
├── <integration>.service.ts  # extends ExternalApi
├── <integration>.module.ts
└── index.ts                  # public barrel
```

**OpenAPI-generated** — third-party HTTP API with a spec (prefer **`@hey-api/openapi-ts`** for codegen; wire through `ExternalApi` + axios in Nest):

```text
infrastructure/services/<ServiceName>/
├── generated/                # read-only; regen via @hey-api/openapi-ts from upstream spec
├── client/
│   ├── <service>.config.ts
│   ├── <service>.client.ts   # extends ExternalApi; wraps generated SDK calls
│   └── index.ts
└── index.ts
```

**Storefront client (web → our API)** lives in **`packages/api-clients`**, not under `apps/api`. Nest only exposes Swagger; generation is configured in `packages/api-clients/openapi-ts.config.ts` with live input `http://localhost:3001/api/docs-json`.

Setup checklist:

1. **Config** — secrets and base URL from env in `<integration>.config.ts` (see [code-style-guide § External API](./code-style-guide.md#10-external-api-integration)).
2. **Client/service** — extend `ExternalApi`; implement `getBaseUrl()`; expose domain-friendly methods (no business orchestration in the client).
3. **Module** — small `*Module` exporting the client; import it in the feature module that orchestrates the flow.
4. **Feature service** — call the client after the primary persistence path; **catch and log** outbound failures when the user-facing operation must still succeed (e.g. notification after order save).

```ts
@Injectable()
export class OrdersService {
  constructor(private readonly notifications: AcmeNotificationService) {}

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.persistOrder(dto);
    try {
      await this.notifications.notifyOrderCreated(order);
    } catch (err) {
      this.logger.error({ msg: 'notification.failed', orderId: order.id, err });
    }
    return toOrderResponse(order);
  }
}
```

---

## 5. Transactions (multi-entity writes)

When a single user action touches multiple tables, wrap writes in one transaction:

```ts
return this.dataSource.transaction(async (manager) => {
  const parent = await manager.getRepository(Parent).save(/* … */);
  await manager.getRepository(Child).save(/* rows linked to parent */);
  return parent;
});
```

Run **side effects** (notifications, webhooks, cache invalidation) **after** commit when possible — not inside the transaction callback.

When child rows must reflect parent state at write time, snapshot immutable fields on the child (e.g. `titleSnapshot`, `unitPriceSnapshot`) so later catalog changes do not rewrite history.

---

## 6. Validators & pipes

### Pagination (`src/utils/pagination.ts`)

Shared query + response shape for all paginated list endpoints (mvp-plan: `page` + **`limit` required**, max 100).

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

const { items: rows, meta } = await PaginationHelper.paginate(repo, filters, {
  where: buildWhere(filters),
  relations: listRelations,
  order: buildOrder(filters.sort),
});

return { items: rows.map(toDto), meta };
```

For joins or custom QB tweaks, use `new PaginationHelper(repo, pagination).execute(options, { addToQueryBuilder })`.

`buildPaginationMeta` / `paginationSkip` remain available for non-standard flows.

### Locale header (`x-app-locale`)

Locale is resolved per request by `localeMiddleware` (`x-app-locale` header → `Accept-Language` → default). Supported values come from `SUPPORTED_LOCALES` in `locale.config.ts`.

**OpenAPI** — document the optional header with `@AppLocaleHeader()` on storefront controllers:

```ts
import { AppLocaleHeader } from '@/utils/app-locale-header.decorator';

@ApiTags('Products')
@AppLocaleHeader()
@Controller('products')
export class ProductsController { /* … */ }
```

Services do not read locale from query DTOs — `LocaleContext` is already bound by middleware. Query DTOs are filter/pagination only.

Regenerate storefront clients after changing DTOs, routes, or OpenAPI metadata (API must be running on port 3001):

```bash
pnpm nx run api:generate:openapi
pnpm --dir apps/web run generate:clients
pnpm nx run api-clients:build
pnpm nx run web:type-check
```

The generated storefront client lives in `packages/api-clients`; hand-written wrappers stay in `src/storefront/client/`.

Shared validators live in `src/utils/validators/` — grep before duplicating.

---

## 7. Tests

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
