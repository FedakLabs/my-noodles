---
name: Inventory reservation draft
overview: 'Підхід B (gross quantity): available = quantity - SUM(non-expired draft order_items). Hold expiry = created_at + DRAFT_HOLD_MS (без колонки expires_at). Deduct на submit; cancel = status only.'
todos:
  - id: inventory-service
    content: 'InventoryService: getAvailableQty (draft + time filter), reconcile, deductOnSubmit, isDraftExpired helper'
    status: completed
  - id: migration-cancelled-reason
    content: 'Migration: orders.cancelled_reason only (no expires_at column)'
    status: pending
  - id: draft-reserve-flow
    content: 'createDraft: reconcile vs getAvailableQty → draft order_items only'
    status: pending
  - id: draft-cancel-flow
    content: cancelDraftOrder + expireStaleDrafts (created_at + hold) + visitor cart idle
    status: pending
  - id: submit-deduct
    content: 'submitDraft: FOR UPDATE, deduct products.quantity, status new'
    status: pending
  - id: cart-stock-guards
    content: 'CartService: ceiling via getAvailableQty(); 409 on OOS or max'
    status: pending
  - id: frontend-409-ux
    content: 'Frontend: 409 handling, checkout timer from expiresAt (computed), i18n'
    status: pending
  - id: tests-e2e
    content: Unit + integration tests inventory; оновити e2e mock-api
    status: pending
isProject: false
---

# Inventory: резерв на draft checkout (підхід B)

## Що роблять Amazon / Shopify / великий retail

| Фаза                  | Типова поведінка             |
| --------------------- | ---------------------------- |
| **Cart (browsing)**   | Без резерву.                 |
| **Checkout start**    | Hold ≈10–15 хв.              |
| **Place order / Pay** | Atomic перевірка + списання. |
| **Cancel / timeout**  | Hold знімається.             |

**Висновок:** cart = без резерву. **Draft `order_items` = hold.** **`products.quantity` = gross.** Expiry = **`created_at + DRAFT_HOLD_MS`** — окремої колонки `expires_at` **не потрібно**.

```mermaid
sequenceDiagram
    participant UI
    participant API
    participant DB

    Note over UI,DB: Cart — no reservation
    UI->>API: POST /cart/items
    API->>DB: available = qty - SUM(non-expired drafts)
    alt exceeds available
        API-->>UI: 409 CartStockLimitException
    else ok
        API->>DB: upsert cart_items
    end

    Note over UI,DB: Checkout — hold in draft order_items
    UI->>API: POST /orders/draft
    API->>DB: reconcile vs available; create draft
    API-->>UI: 201 draft order

    Note over UI,DB: Submit — deduct gross quantity
    UI->>API: POST /orders/:id/submit
    API->>DB: guard not expired; deduct; status new
    API-->>UI: 200 order

    Note over UI,DB: Cancel/expiry — status cancelled, leaves SUM
    API->>DB: cancelDraftOrder
```

---

## Рішення для my-noodles (підхід B)

### Модель stock

|                     |                                                           |
| ------------------- | --------------------------------------------------------- |
| `products.quantity` | **Gross** — фізичний склад                                |
| Hold                | `order_items` where parent order is **non-expired draft** |
| **Available**       | `quantity - SUM(reserved qty)`                            |
| Draft create        | Reconcile + insert draft — **quantity unchanged**         |
| Submit              | **`quantity -= line.qty`** + `status = new`               |
| Cancel / expiry     | `status = cancelled` — **quantity unchanged**             |

### Чи потрібна колонка `expires_at`?

**Ні.** Expiry timestamp = `order.created_at + DRAFT_HOLD_MS` (константа поруч з [`CART_IDLE_MS`](apps/api/src/application/visitor/visitor-session.cookie.ts), default **15 хв**).

| Use case            | Як                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Checkout timer (UI) | API повертає **computed** `expiresAt: createdAt + hold` у `OrderCheckoutDto` — не зберігаємо в DB |
| Lazy expiry         | `isDraftExpired(order)` → `createdAt + hold < now`                                                |
| Cron                | `find({ status: Draft, createdAt: LessThanOrEqual(draftHoldMinCreatedAt()) })`                    |
| Submit guard        | reject якщо `isDraftExpired`                                                                      |

**Trade-off:** fixed hold від `created_at`, не sliding на PATCH activity — OK для MVP (було в plan як phase 2). Sliding timer пізніше = `expires_at` або `updated_at + hold`.

### Чи достатньо `status = draft` у SUM без time filter?

**Ні — небезпечно.**

Якщо рахувати лише `o.status = draft`:

- Draft прострочений, але cron ще не перевів у `cancelled` → **phantom reserve** (undersell)
- Вікно між expiry і lazy/cron cancel може тривати хвилини

**Active draft** для SUM = **обидва** умови:

1. `status = draft`
2. `createdAt > now() - DRAFT_HOLD_MS` (через `MoreThan(draftHoldMinCreatedAt())` — без Raw SQL)

Після submit (`new`) або cancel — draft **не потрапляє** в SUM через status. Time filter — для «zombie» draft, які ще не скасовані.

Еквівалент: `created_at + hold > now()` ⟺ `created_at > now() - hold`.

### `getAvailableQty` — repository-first (без QueryBuilder для single product)

TypeORM nested `where` на relation `order` — type-safe, як у [`products.filters.ts`](apps/api/src/application/products/products.filters.ts).

```typescript
// inventory.config.ts (або поруч з visitor-session.cookie.ts)
export const DRAFT_HOLD_MS = 15 * 60_000;

export function draftHoldMinCreatedAt(now = Date.now()): Date {
  return new Date(now - DRAFT_HOLD_MS);
}

/** Shared fragment — reuse в getAvailableQty, expireStaleDrafts, tests */
export function activeDraftOrderWhere(now = Date.now()) {
  return {
    status: OrderStatus.Draft,
    createdAt: MoreThan(draftHoldMinCreatedAt(now)),
  } satisfies FindOptionsWhere<Order>;
}

export function isDraftExpired(order: Order, now = Date.now()): boolean {
  return (
    order.status === OrderStatus.Draft && order.createdAt.getTime() <= draftHoldMinCreatedAt(now).getTime()
  );
}

export function draftExpiresAt(order: Order): string {
  return new Date(order.createdAt.getTime() + DRAFT_HOLD_MS).toISOString();
}
```

**Single product** — `orderItemsRepository` + nested where (lock product окремо):

```typescript
async getAvailableQty(productId: string, em: EntityManager): Promise<number> {
  const product = await em.findOne(Product, {
    where: { id: productId },
    lock: { mode: 'pessimistic_write' },
  });
  if (!product) return 0;

  const reserved =
    (await em.sum(OrderItem, 'qty', {
      productId,
      order: activeDraftOrderWhere(),
    })) ?? 0;

  return product.quantity - reserved;
}
```

Якщо `em.sum` з nested relation не згенерує JOIN у вашій версії TypeORM — fallback без QueryBuilder:

```typescript
const rows = await em.find(OrderItem, {
  where: { productId, order: activeDraftOrderWhere() },
  select: { qty: true },
});
const reserved = rows.reduce((s, r) => s + r.qty, 0);
```

**Batch (cart reconcile)** — один `find`, group in memory:

```typescript
async getAvailableQtyBatch(productIds: string[], em: EntityManager): Promise<Map<string, number>> {
  const products = await em.find(Product, {
    where: { id: In(productIds) },
    lock: { mode: 'pessimistic_write' },
  });
  const rows = await em.find(OrderItem, {
    where: { productId: In(productIds), order: activeDraftOrderWhere() },
    select: { productId: true, qty: true },
  });
  const reservedByProduct = groupSumBy(rows, (r) => r.productId, (r) => r.qty);
  return new Map(products.map((p) => [p.id, p.quantity - (reservedByProduct.get(p.id) ?? 0)]));
}
```

**QueryBuilder** — лише якщо batch SUM стане perf bottleneck (unlikely MVP). Не для single-product path.

**Cron `expireStaleDrafts`:** `ordersRepository.find({ where: { status: Draft, createdAt: LessThanOrEqual(draftHoldMinCreatedAt()) } })` — теж repository, без QB.

### Де синхронізувати

| Момент                    | Дія                                                       |
| ------------------------- | --------------------------------------------------------- |
| `addItem` / `updateItem`  | `getAvailableQty()`                                       |
| `POST /orders/draft`      | Reconcile → draft або `409 CartInventoryChanged`          |
| `GET /orders/:id`         | Якщо `isDraftExpired` → `cancelDraftOrder(Expired)` → 409 |
| `POST /orders/:id/submit` | Guard not expired → deduct → `new`                        |

### `cancelled_reason` (без `expires_at`)

```typescript
export enum OrderCancelledReason {
  User = 'user',
  Expired = 'expired',
  Replaced = 'replaced',
  CartIdle = 'cart_idle',
}
```

**`cancelDraftOrder(order, reason)`:** `status = cancelled`, `cancelledReason = reason`. Quantity не чіпаємо.

---

## Backend implementation

### 1. `InventoryService`

- `getAvailableQty` / `getAvailableQtyBatch` — `find`/`sum` + `activeDraftOrderWhere()` (no QB for MVP)
- `draftHoldMinCreatedAt`, `isDraftExpired`, `draftExpiresAt` — shared helpers in `inventory.config.ts`
- `reconcileLines`, `deductOnSubmit`

### 2. Exceptions (409)

| Exception                         | Коли                     |
| --------------------------------- | ------------------------ |
| `CartProductOutOfStockException`  | available === 0          |
| `CartMaxQuantityReachedException` | > available              |
| `CartInventoryChangedException`   | draft create             |
| `OrderDraftExpiredException`      | get/submit expired draft |
| `OrderInventoryChangedException`  | submit: gross < line qty |

### 3. `OrdersService`

**`createDraft`:** reconcile → create draft (createdAt auto) — no `expiresAt` column.

**`getCheckout`:** include computed `expiresAt: draftExpiresAt(order)` in DTO when `status === draft`.

**`submitDraft`:** `ensureDraftActive` → deduct → `status = new`.

**`expireStaleDrafts`:** `ordersRepository.find({ where: { status: Draft, createdAt: LessThanOrEqual(draftHoldMinCreatedAt()) } })`.

### 4. Migration

- `ALTER orders ADD cancelled_reason text NULL` only
- **No** `expires_at` column

### 5. Tests

- Draft past hold still `status=draft` → **not counted** in `getAvailableQty` (time filter)
- After cron/lazy cancel → `cancelled_reason=expired`, not in SUM
- Submit → quantity decremented; no expires_at column
- Computed `expiresAt` in checkout DTO matches `createdAt + hold`

---

## Frontend

- Checkout timer: `orderCheckout.expiresAt` (computed from API)
- Решта без змін (409 warnings, stepper max, i18n)

---

## Порядок впровадження

1. `InventoryService` + `isDraftExpired` + migration `cancelled_reason`
2. `createDraft` / cancel / expiry cron
3. `submitDraft` deduct
4. Cart guards + computed `expiresAt` in DTO + frontend
5. OpenAPI + tests + e2e
