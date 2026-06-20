# Common Patterns — Backend (NestJS + TypeORM)

Recipes for `apps/api`. **Grep the repo first** — use domain names from this project (products, collections, orders), not generic CRUD scaffolds from other codebases.

> Read [code-style-guide.md](./code-style-guide.md). Architecture: `docs/mvp-plan.md`.

---

## Table of Contents

1. [Adding an endpoint](#1-adding-an-endpoint)
2. [New feature module](#2-new-feature-module)
3. [Entity + migration](#3-entity--migration)
4. [Telegram client (external API)](#4-telegram-client-external-api)
5. [Transactions (Order + OrderItem)](#5-transactions-order--orderitem)
6. [Throttling + honeypot](#6-throttling--honeypot)
7. [Validators & pipes](#7-validators--pipes)
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
| `~products.test.ts`      | unit + supertest                           |

```ts
@Get(':slug')
async getBySlug(
  @Param('slug') slug: string,
  @Query() query: LocaleQueryDto,
): Promise<ProductDetailDto> {
  return this.productsService.getBySlug(slug, query.locale);
}
```

---

## 2. New feature module

Domains in mvp-plan: **products** (incl. facets), **collections**, **countries**, **brands**, **orders**.

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
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), TelegramModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

`TelegramModule` is imported from `@/infrastructure/services/Telegram` — not `telegram.module`.

Register in `AppModule.imports` — import each feature module from its barrel (`./application/orders`), not `orders.module`.

**Sub-feature:** `application/products/facets/` for `GET /api/products/facets` — separate controller/service or methods on `ProductsService`; match what the repo uses once scaffolded.

**Product filters:** build `FindOptionsWhere<Product>` in `products.filters.ts` (`buildProductWhere`, `buildProductOrder`); use `findAndCount` for list, `find` + in-memory aggregation for facets. See [code-style-guide § Repository queries](./code-style-guide.md#repository-queries).

---

## 3. Entity + migration

- Extend `TimestampEntity` (`infrastructure/persistence/timestamp.entity.ts`) — `created_at`, `updated_at`, `deleted_at` on every table.
- Entities: JSONB `{ uk, en }` on `name`, `description`, `story`, `forWhom` where applicable
- `priceMinor` + `currency`; `quantity` with derived `inStock`
- FK relations: `onUpdate: 'CASCADE'`; `onDelete: 'RESTRICT'` on **all** FKs — **never** `onDelete: 'CASCADE'` or `SET NULL`
- SQL migrations: see [code-style-guide.md § Migrations](./code-style-guide.md#9-migrations) — inline named FKs, partial indexes on `deleted_at IS NULL`
- Initial schema: one migration per **domain scope** (`CreateCatalog`, then `CreateOrders`); add new timestamped files as changes arise

```bash
pnpm nx run api:migration:run
pnpm nx run api:migration:revert   # rolls back one migration
```

Both `up` and `down`. Test run → revert → run.

---

## 4. Telegram client (external API)

Hand-written client — **not** `packages/api-clients` (that package is for the web app calling **our** API).

```text
infrastructure/services/Telegram/client/telegram.client.ts
infrastructure/services/Telegram/telegram.module.ts
```

`OrdersService.create`: persist order, then notify Telegram; **catch and log** — order still succeeds if Telegram is down (mvp-plan).

Env: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

---

## 5. Transactions (Order + OrderItem)

```ts
return this.dataSource.transaction(async (manager) => {
  const order = await manager.getRepository(Order).save(/* … */);
  await manager.getRepository(OrderItem).save(/* line snapshots */);
  return order;
});
```

Run Telegram **after** commit if possible. Snapshots: `titleSnapshot`, `priceMinorSnapshot` on `OrderItem`.

---

## 6. Throttling + honeypot

Global Throttler ~60/min per IP. Orders:

```ts
@Post()
@Throttle({ default: { limit: 5, ttl: 60_000 } })
create(@Body() dto: CreateOrderDto) {
  if (dto.company) throw new BadRequestException('Invalid submission');
  return this.ordersService.create(dto);
}
```

Hidden `company` field in DTO — reject when filled.

---

## 7. Validators & pipes

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

Shared validators live in `src/utils/validators/` — grep before duplicating.

---

## 8. Tests

**Unit** — mock repository/client:

```ts
const module = await Test.createTestingModule({
  providers: [
    OrdersService,
    { provide: getRepositoryToken(Order), useValue: orderRepo },
    { provide: TelegramClient, useValue: { sendOrderNotification: jest.fn() } },
  ],
}).compile();
```

**E2E** — supertest with global prefix `api`:

```ts
await request(app.getHttpServer()).post('/api/orders').send(payload).expect(201);
```

Cover: validation 400, not-found 404, honeypot, Telegram failure tolerance.

```bash
pnpm nx run api:test
pnpm nx run api:fix
```
