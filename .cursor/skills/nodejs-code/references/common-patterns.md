# Nodejs Code Common Patterns

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

---

## 4. External API integration

**Client layer** — framework-agnostic HTTP clients live in `@my-noodles/api-clients/<provider>` and extend `ApiClient`. Nest wiring lives under `application/<provider>/` like any other feature module:

```text
packages/api-clients/<provider>/
├── <provider>.client.ts      # *Api extends ApiClient; raw upstream calls
└── index.ts

apps/api/src/application/<provider>/
├── <provider>.config.ts      # env → base URL, auth
├── <provider>.service.ts     # optional *Service — mapping/formatting
├── <provider>.module.ts      # useFactory registration; exports *Service
└── index.ts
```

Example: `TelegramApi` in `@my-noodles/api-clients/telegram` + `TelegramService` / `TelegramModule` in `application/telegram/`.

Setup checklist:

1. **Client** — extend `ApiClient` in `packages/api-clients`; accept options + logger; expose upstream-shaped methods (no business orchestration).
2. **Config** — secrets and base URL from env in `<provider>.config.ts` (see [code-style-guide § External API](./code-style-guide.md#10-external-api-integration)).
3. **Service (optional)** — Nest provider; inject `*Api`; add formatting/mapping when adapters or feature services need a friendlier surface.
4. **Module** — `useFactory` to construct `*Api` with validated config + `APP_LOGGER`; import in the feature module that orchestrates the flow.
5. **Feature service** — call the service (or api) after the primary persistence path; **catch and log** outbound failures when the user-facing operation must still succeed (e.g. notification after order save).

---

## 5. Transactions (multi-entity writes)

// TODO: infer the usage of transactions from code that you may observe and write this section

---

## 6. Validators & pipes

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
