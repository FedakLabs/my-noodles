---
name: Delivery Service Architecture
overview: 'Гібридна архітектура: окремий `DeliveryModule` з factory-адаптерами для каталогу (міста/відділення) + обчислений `deliveryEstimate` у `GET /orders/:id`, коли в draft достатньо введених даних. Перший етап — абстракція + stub-адаптери, ETA без вартості.'
todos:
  - id: delivery-interface-factory
    content: 'Створити application/delivery: interface, factory, 3 stub-адаптери, DeliveryService'
    status: completed
  - id: delivery-controller
    content: GET /delivery/providers, /cities, /warehouses + DTOs/exceptions
    status: completed
  - id: order-estimate
    content: Розширити OrderCheckoutDto deliveryEstimate; OrdersService → DeliveryService.estimateForOrder
    status: completed
  - id: wire-modules
    content: DeliveryModule + імпорт в OrdersModule та AppModule
    status: completed
  - id: tests-openapi
    content: Unit/supertest tests; regenerate OpenAPI + api-clients
    status: completed
  - id: followup-frontend-checkout
    content: 'Frontend: provider picker, city/warehouse autocomplete, показ deliveryEstimate на checkout'
    status: completed
  - id: followup-nova-poshta-api
    content: Реальний Nova Poshta HTTP client в infrastructure/external-apis; adapter делегує NovaPoshtaService
    status: completed
  - id: followup-meest-ukrposhta-api
    content: Реальні Meest + Ukrposhta clients; замінити stub-адаптери
    status: completed
  - id: followup-catalog-cache
    content: In-memory або Redis TTL cache для cities/warehouses (rate limits)
    status: completed
  - id: followup-eta-snapshot
    content: 'Migration: estimated_delivery_at на order_deliveries; snapshot на submit + Telegram/success'
    status: completed
  - id: followup-shipping-cost
    content: shippingCostMinor + тарифна модель (коли буде scope)
    status: cancelled
isProject: false
---

# Delivery Service: абстракція провайдерів + ETA в checkout

## Рекомендація: гібрид (не «або-або»)

| Що                                         | Де в API                                                                                       | Чому                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Каталог провайдера** (міста, відділення) | `GET /delivery/*`                                                                              | Stateless lookup; не прив’язаний до order id; кешується окремо; UI викликає до/під час autosave         |
| **Розрахунок для поточного checkout**      | `deliveryEstimate` у [`GET /orders/:id`](apps/api/src/application/orders/orders.controller.ts) | Залежить від збережених полів draft + `order_items` + `createdAt` (час відправки «якщо оформити зараз») |

**Чому не тільки `GET /orders/:id`:** списки міст/відділень — це окремий concern (autocomplete, pagination, provider-specific refs). Якщо зашити їх у orders resource, з’являться штучні маршрути на кшталт `GET /orders/:id/delivery/cities` — semantically гірше і важче кешувати.

**Чому не тільки `/delivery`:** ETA «для цього замовлення зараз» — order-centric. Клієнт уже refetch’ить checkout після PATCH; один round-trip з `deliveryEstimate` простіший для UI і гарантує консистентність зі snapshot items.

```mermaid
flowchart TB
  subgraph checkout [Checkout flow]
    UI[CheckoutForm]
    UI -->|PATCH delivery fields| OrdersAPI[PATCH /orders/:id]
    UI -->|autocomplete| DeliveryAPI[GET /delivery/cities|warehouses]
    UI -->|refetch| GetOrder[GET /orders/:id]
  end

  subgraph backend [Backend]
    OrdersService[OrdersService]
    DeliveryService[DeliveryService]
    Factory[DeliveryProviderFactory]
    NP[NovaPoshtaAdapter stub]
    Meest[MeestAdapter stub]
    UP[UkrposhtaAdapter stub]

    OrdersAPI --> OrdersService
    GetOrder --> OrdersService
    DeliveryAPI --> DeliveryService
    OrdersService -->|estimateDelivery| DeliveryService
    DeliveryService --> Factory
    Factory --> NP
    Factory --> Meest
    Factory --> UP
  end
```

---

## Поточний стан (baseline)

- Draft autosave вже зберігає `OrderDelivery` по мірі введення ([`OrdersService.updateDraft`](apps/api/src/application/orders/orders.service.ts)).
- Enums `DeliveryProvider` / `DeliveryMethod` і поля адреси є ([`order-delivery.dto.ts`](apps/api/src/application/orders/order-delivery.dto.ts), [`order-delivery.entity.ts`](apps/api/src/application/orders/order-delivery.entity.ts)).
- **Немає** розрахунку ETA, окремого delivery module, provider API clients.
- Frontend hardcode Nova Poshta warehouse + free-text ([`checkout-form.tsx`](apps/web/src/components/checkout/checkout-form.tsx)) — зміни frontend **поза scope цього етапу**, але API має бути готовим.

---

## Цільова структура модулів

```
apps/api/src/application/delivery/
├── delivery.module.ts
├── delivery.controller.ts      # GET /delivery/*
├── delivery.service.ts         # orchestration + estimateDelivery()
├── delivery.dto.ts             # public DTOs (CityDto, WarehouseDto, EstimateDto)
├── delivery.exceptions.ts
├── delivery.types.ts           # DeliveryQuoteInput, canonical address types
├── providers/
│   ├── delivery-provider.interface.ts
│   ├── delivery-provider.factory.ts
│   ├── nova-poshta.adapter.ts  # stub
│   ├── meest.adapter.ts        # stub
│   └── ukrposhta.adapter.ts    # stub
└── index.ts
```

Патерн узгоджений з [nodejs common-patterns § External API](.cursor/skills/nodejs-code/references/common-patterns.md): domain orchestration в `application/delivery/`, реальні HTTP clients в `infrastructure/external-apis/<provider>/` без зміни публічного API.

### Інтерфейс адаптера (canonical model)

```typescript
interface DeliveryProviderAdapter {
  readonly provider: DeliveryProvider;

  searchCities(query: string): Promise<DeliveryCity[]>;
  searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]>;
  estimate(input: DeliveryEstimateInput): Promise<DeliveryEstimate>;
}
```

**Canonical types** (provider-agnostic):

- `DeliveryCity`: `{ ref, name }`
- `DeliveryWarehouse`: `{ ref, number, name, address? }`
- `DeliveryEstimateInput`: `{ provider, method, cityRef?, cityName?, warehouseRef?, street?, building?, orderCreatedAt, itemCount }`
- `DeliveryEstimate`: `{ estimatedDeliveryAt: string; estimatedDaysMin: number; estimatedDaysMax: number }`

Factory резолвить адаптер за `DeliveryProvider` enum — без switch у controller/service.

---

## Публічний API (нові ендпоінти)

### Delivery catalog (stateless)

| Method | Route                  | Query                         | Response                         |
| ------ | ---------------------- | ----------------------------- | -------------------------------- |
| `GET`  | `/delivery/providers`  | —                             | `[{ id, label }]` (3 провайдери) |
| `GET`  | `/delivery/cities`     | `provider`, `q` (min 2 chars) | `DeliveryCity[]`                 |
| `GET`  | `/delivery/warehouses` | `provider`, `cityRef`, `q?`   | `DeliveryWarehouse[]`            |

Throttling через існуючий global guard. Валідація query через DTO + `ValidationPipe`.

### Розширення `OrderCheckoutDto`

Додати **окреме поле** (не змішувати з persisted address):

```typescript
deliveryEstimate: {
  estimatedDeliveryAt: string;      // ISO date-time
  estimatedDaysMin: number;
  estimatedDaysMax: number;
} | null;
```

**`null`** коли даних недостатньо — UI показує placeholder «оберіть місто та відділення».

#### Умови достатності для estimate

| Method      | Required fields                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| `warehouse` | `provider`, `city` (або `cityRef` після інтеграції), `warehouseRef` **або** `warehouseNumber` |
| `courier`   | `provider`, `city`, `street`, `building`                                                      |

Логіка в `DeliveryService.canEstimate(delivery)` + `DeliveryService.estimateFromOrder(order)`.

`OrdersService.toOrderDetail()` викликає estimate **після** завантаження relations; помилки провайдера → `deliveryEstimate: null` + log (checkout не падає).

---

## Stub-адаптери (перший етап)

Без реальних API ключів — детермінована поведінка для dev/test:

- **Cities:** фільтр по `q` з фіксованого списку (Київ, Львів, Одеса…) + stable `ref`.
- **Warehouses:** 5–10 фейкових відділень на cityRef.
- **Estimate:** проста формула:
  - base days: warehouse = 2–3, courier = 1–2
  - +0–1 day per provider (Meest +1, Ukrposhta +1) — ілюструє різницю
  - `estimatedDeliveryAt` = `max(now, orderCreatedAt + dispatchCutoff)` + `estimatedDaysMin` calendar days
  - dispatch cutoff stub: замовлення до 14:00 → відправка сьогодні, після — завтра

Це дає frontend реальні поля для UX без зовнішніх залежностей.

---

## Інтеграція з OrdersModule

[`OrdersModule`](apps/api/src/application/orders/orders.module.ts) імпортує `DeliveryModule`.

Зміни в [`OrdersService`](apps/api/src/application/orders/orders.service.ts):

```typescript
// toOrderDetail()
deliveryEstimate: await this.deliveryService.estimateForOrder(order),
```

**Не зберігати** estimate в БД на цьому етапі — це derived data. Після submit можна snapshot’ити в майбутньому (колонка `estimated_delivery_at` на `order_deliveries`), але для draft достатньо on-the-fly.

[`app.module.ts`](apps/api/src/app.module.ts): зареєструвати `DeliveryModule`.

---

## DTO / OpenAPI / client gen

1. Розширити [`orders.dto.ts`](apps/api/src/application/orders/orders.dto.ts) — `OrderDeliveryEstimateDto`.
2. Новий [`delivery.dto.ts`](apps/api/src/application/delivery/delivery.dto.ts).
3. Після змін: `pnpm nx run api:generate:openapi` + regenerate storefront client (за [nodejs SKILL](.cursor/skills/nodejs-code/SKILL.md)).

Frontend types з’являться в `packages/api-clients` автоматично; UI wiring — наступний PR.

---

## Тести

| Файл                           | Що покрити                                          |
| ------------------------------ | --------------------------------------------------- |
| `~delivery.service.test.ts`    | factory resolution, `canEstimate`, stub ETA formula |
| `~delivery.controller.test.ts` | supertest cities/warehouses validation              |
| `~orders.service.test.ts`      | `getCheckout` повертає `deliveryEstimate` / `null`  |

Stub-адаптери — unit-testable без HTTP mocks.

---

## Follow-up after implementation (наступні PR)

Цей етап закриває **backend API + stubs**. Після merge — окремі задачі:

| ID                             | Задача                                                                                         | Залежить від           |
| ------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------- |
| `followup-frontend-checkout`   | Provider picker, autocomplete міст/відділень через `GET /delivery/*`, показ `deliveryEstimate` | api-clients regen      |
| `followup-nova-poshta-api`     | `infrastructure/external-apis/nova-poshta/` + env `NOVA_POSHTA_API_KEY`                        | delivery module merged |
| `followup-meest-ukrposhta-api` | Реальні Meest / Ukrposhta adapters замість stub                                                | nova-poshta pattern    |
| `followup-catalog-cache`       | TTL cache для cities/warehouses                                                                | real API integration   |
| `followup-eta-snapshot`        | Колонка `estimated_delivery_at` на `order_deliveries`, snapshot на submit                      | orders submit flow     |
| `followup-shipping-cost`       | `shippingCostMinor` + оновлення total logic                                                    | тарифна модель (TBD)   |

---

## Майбутнє розширення (не в цьому PR)

1. **Реальні клієнти:** `infrastructure/external-apis/nova-poshta/` (`NovaPoshtaApi` + `NovaPoshtaService`) з env `NOVA_POSHTA_API_KEY`; adapter делегує service, interface не змінюється.
2. **Кеш:** Redis/in-memory TTL для cities/warehouses (provider API rate limits).
3. **Shipping cost:** окреме поле `shippingCostMinor` + оновлення `totalMinor` logic — коли буде тарифна модель.
4. **Post-submit snapshot:** persist `estimatedDeliveryAt` на submit для Telegram / success page.
5. **Frontend:** provider picker, city/warehouse autocomplete, показ ETA з `deliveryEstimate`.

---

## Future-proof checklist

- Canonical address model не залежить від NP/Meest/Ukrposhta response shape.
- Factory + interface — додати 4-й провайдер = новий adapter + enum value, без змін controller.
- Catalog endpoints стабільні для UI autocomplete.
- Order estimate залишається thin delegation — business rules в `DeliveryService`, не в `OrdersService`.
- Derived estimate не в БД → немає drift при зміні формули; submit snapshot — окремий крок коли потрібна історична точність.
