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

Register in `AppModule.imports`.

**Sub-feature:** `application/products/facets/` for `GET /api/products/facets` — separate controller/service or methods on `ProductsService`; match what the repo uses once scaffolded.

---

## 3. Entity + migration

- Entities: JSONB `{ uk, en }` on `name`, `description`, `story`, `forWhom` where applicable
- `priceMinor` + `currency`; `quantity` with derived `inStock`
- Generate migration into `infrastructure/migrations/`

```bash
pnpm nx run api:migration:generate -- src/infrastructure/migrations/AddProducts
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

Pagination (mvp-plan): `page` + **`limit` required when paginating**, max 100.

```ts
export class ListProductsQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @IsOptional()
  @IsIn(['uk', 'en'])
  locale?: string;
}
```

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
