/**
 * Typed storefront fixtures for the e2e mock API.
 * Shapes follow `@my-noodles/api-clients/storefront` (OpenAPI-generated) response types.
 *
 * Note: OpenAPI marks some nullable entity fields as required, and includes inverse
 * relations that TypeORM does not serialize. Builders fill type-required fields; wire
 * JSON matches what Nest actually returns for the funnel.
 */
import type {
  AddCartItemDto,
  Brand,
  CartItem,
  CartResponseDto,
  Category,
  Checkout,
  Country,
  DeliveryCityDto,
  DeliveryProviderDto,
  DeliveryWarehouseDto,
  HealthStatusDto,
  Order,
  OrderDelivery,
  OrderDeliveryEstimateDto,
  OrderItem,
  PaginatedProductsDto,
  Product,
  ProductFacetsResponseDto,
  UpdateCheckoutDeliveryDto,
  VisitorSession,
} from '@my-noodles/api-clients/storefront';

export const MOCK_IDS = {
  product: '11111111-1111-4111-8111-111111111111',
  brand: '55555555-5555-4555-8555-555555555555',
  country: '66666666-6666-4666-8666-666666666666',
  category: '77777777-7777-4777-8777-777777777777',
  checkout: '22222222-2222-4222-8222-222222222222',
  order: '44444444-4444-4444-8444-444444444444',
  orderItem: '88888888-8888-4888-8888-888888888888',
  orderDelivery: '99999999-9999-4999-8999-999999999999',
  cartItem: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  visitorSession: '33333333-3333-4333-8333-333333333333',
} as const;

export const MOCK_VSID = MOCK_IDS.visitorSession;

/**
 * OpenAPI marks `cancelledReason` as required, but Nest returns `null` while active.
 * Wire types keep fixtures honest to runtime JSON while staying derived from client types.
 */
export type WireOrder = Omit<Order, 'cancelledReason'> & {
  cancelledReason: Order['cancelledReason'] | null;
};

export type WireCheckout = Omit<Checkout, 'cancelledReason' | 'order'> & {
  cancelledReason: Checkout['cancelledReason'] | null;
  order: WireOrder;
};

function holdExpiresAt(minutes = 15): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

const visitorSession = {
  id: MOCK_IDS.visitorSession,
  feedExpiresAt: holdExpiresAt(60),
  cartExpiresAt: holdExpiresAt(60),
  likes: [],
  views: [],
} as const satisfies VisitorSession;

const brand = {
  id: MOCK_IDS.brand,
  slug: 'glico',
  name: 'Glico',
  logoUrl: null,
  themeKey: null,
  products: [],
} as const satisfies Brand;

const country = {
  id: MOCK_IDS.country,
  code: 'TW',
  slug: 'taiwan',
  name: 'Тайвань',
  flagEmoji: '🇹🇼',
  themeKey: 'TW',
  products: [],
} as const satisfies Country;

const category = {
  id: MOCK_IDS.category,
  slug: 'snacks',
  name: 'Снеки',
  icon: null,
  sortOrder: 1,
  themeKey: null,
  products: [],
} as const satisfies Category;

export const product = {
  id: MOCK_IDS.product,
  slug: 'pocky-matcha',
  name: 'Pocky Matcha',
  description: 'Matcha-flavoured biscuit sticks.',
  story: 'A classic Japanese snack.',
  forWhom: 'Matcha lovers',
  weight: '47g',
  priceMinor: 9900,
  currency: 'UAH',
  flavor: { spice: 0, sweet: 3, texture: 'crispy' },
  allergens: ['milk'],
  images: ['https://example.com/pocky.jpg'],
  videos: [],
  isTriedByUs: true,
  quantity: 10,
  sortWeight: 10,
  inStock: true,
  brandId: MOCK_IDS.brand,
  brand,
  countryId: MOCK_IDS.country,
  country,
  categoryId: MOCK_IDS.category,
  category,
  alternatives: [],
  alternativeOf: [],
  collections: [],
} as const satisfies Product;

export const healthLive = { status: 'ok' } as const satisfies HealthStatusDto;

export const productsList = {
  items: [product],
  meta: { total: 1, currentTotal: 1, page: 1, limit: 12 },
} as const satisfies PaginatedProductsDto;

export const productFacets = {
  total: 1,
  facets: {
    category: [{ value: 'snacks', label: 'Снеки', count: 1 }],
    country: [{ value: 'taiwan', label: 'Тайвань', count: 1 }],
    brand: [{ value: 'glico', label: 'Glico', count: 1 }],
    price: { min: 9900, max: 9900 },
    isTriedByUs: 1,
    inStock: 1,
  },
} as const satisfies ProductFacetsResponseDto;

export const deliveryProviders = [
  { id: 'nova-poshta', label: 'Нова Пошта' },
  { id: 'meest', label: 'Meest' },
  { id: 'ukrposhta', label: 'Укрпошта' },
] as const satisfies readonly DeliveryProviderDto[];

export const deliveryCities = [
  { ref: 'city-kyiv', name: 'Київ' },
  { ref: 'city-lviv', name: 'Львів' },
  { ref: 'city-odesa', name: 'Одеса' },
] as const satisfies readonly DeliveryCityDto[];

export const deliveryWarehouses = [
  { ref: 'wh-kyiv-1', number: '1', name: 'Відділення №1', address: 'вул. Центральна, 1' },
  { ref: 'wh-kyiv-2', number: '5', name: 'Відділення №5', address: 'просп. Перемоги, 12' },
] as const satisfies readonly DeliveryWarehouseDto[];

export function emptyCart(): CartResponseDto {
  return {
    items: [],
    totalMinor: 0,
    itemCount: 0,
    currency: 'UAH',
  };
}

function createCartItem(qty: number, lineProduct: Product = product): CartItem {
  return {
    id: MOCK_IDS.cartItem,
    visitorSessionId: MOCK_IDS.visitorSession,
    visitorSession,
    productId: lineProduct.id,
    product: lineProduct,
    qty,
  };
}

function cartFromItems(items: CartItem[]): CartResponseDto {
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const totalMinor = items.reduce((sum, item) => sum + item.product.priceMinor * item.qty, 0);

  return {
    items,
    itemCount,
    totalMinor,
    currency: items[0]?.product.currency ?? 'UAH',
  };
}

export function addToCart(cart: CartResponseDto, body: AddCartItemDto): CartResponseDto {
  const qty = body.qty ?? 1;
  const existing = cart.items.find((item) => item.productId === body.productId);

  if (existing) {
    return cartFromItems(
      cart.items.map((item) => (item.productId === body.productId ? { ...item, qty: item.qty + qty } : item)),
    );
  }

  return cartFromItems([...cart.items, createCartItem(qty, product)]);
}

function createOrderItem(orderId: string, line: CartItem): OrderItem {
  return {
    id: MOCK_IDS.orderItem,
    orderId,
    order: null as unknown as Order,
    productId: line.productId,
    product: line.product,
    titleSnapshot: line.product.name ?? line.product.slug,
    priceMinorSnapshot: line.product.priceMinor,
    qty: line.qty,
  };
}

type DeliveryEstimateInput = {
  provider?: UpdateCheckoutDeliveryDto['provider'] | OrderDelivery['provider'] | null;
  method?: UpdateCheckoutDeliveryDto['method'] | OrderDelivery['method'] | null;
  city?: string | null;
  warehouseRef?: string | null;
  warehouseNumber?: string | null;
  street?: string | null;
  building?: string | null;
};

function buildDeliveryEstimate(
  delivery: DeliveryEstimateInput | null | undefined,
): OrderDeliveryEstimateDto | null {
  if (!delivery?.city) {
    return null;
  }

  if (delivery.method === 'courier') {
    if (!delivery.street?.trim() || !delivery.building?.trim()) {
      return null;
    }
  } else if (!(delivery.warehouseRef || delivery.warehouseNumber)) {
    return null;
  }

  const providerRates: Record<string, number> = {
    'nova-poshta': 6500,
    meest: 7500,
    ukrposhta: 5500,
  };

  return {
    estimatedDeliveryAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDaysMin: 2,
    estimatedDaysMax: 3,
    shippingCostMinor: providerRates[delivery.provider ?? 'nova-poshta'] ?? 6500,
  };
}

function applyTotals(checkout: WireCheckout): WireCheckout {
  const shippingCostMinor = checkout.deliveryEstimate?.shippingCostMinor;
  const { order } = checkout;
  return {
    ...checkout,
    order: {
      ...order,
      grandTotalMinor: shippingCostMinor != null ? order.totalMinor + shippingCostMinor : order.totalMinor,
    },
  };
}

export function createCheckoutFromCart(cart: CartResponseDto): WireCheckout {
  const expiresAt = holdExpiresAt();
  const items = cart.items.map((line) => createOrderItem(MOCK_IDS.order, line));

  const order: WireOrder = {
    id: MOCK_IDS.order,
    visitorSessionId: MOCK_IDS.visitorSession,
    visitorSession,
    firstName: null,
    lastName: null,
    phone: null,
    totalMinor: cart.totalMinor,
    grandTotalMinor: cart.totalMinor,
    currency: cart.currency,
    status: 'draft',
    cancelledReason: null,
    delivery: null,
    items,
    checkout: null,
  };

  return {
    id: MOCK_IDS.checkout,
    orderId: MOCK_IDS.order,
    order,
    visitorSessionId: MOCK_IDS.visitorSession,
    visitorSession,
    status: 'in_progress',
    cancelledReason: null,
    completedAt: null,
    expiresAt,
    isExpired: false,
    deliveryEstimate: null,
  };
}

export function patchCheckoutReceiver(
  checkout: WireCheckout,
  body: { firstName?: string; lastName?: string; phone?: string },
): WireCheckout {
  const order: WireOrder = { ...checkout.order };
  if (body.firstName !== undefined) {
    order.firstName = body.firstName;
  }
  if (body.lastName !== undefined) {
    order.lastName = body.lastName;
  }
  if (body.phone !== undefined) {
    order.phone = body.phone;
  }

  return applyTotals({ ...checkout, order });
}

export function patchCheckoutDelivery(checkout: WireCheckout, body: UpdateCheckoutDeliveryDto): WireCheckout {
  const previous = checkout.order.delivery;
  const baseDelivery: OrderDelivery = {
    id: previous?.id ?? MOCK_IDS.orderDelivery,
    orderId: checkout.orderId,
    order: null as unknown as Order,
    provider: body.provider ?? previous?.provider ?? 'nova-poshta',
    method: body.method ?? previous?.method ?? 'warehouse',
    city: body.city ?? previous?.city ?? null,
    cityRef: body.cityRef ?? previous?.cityRef ?? null,
    warehouseNumber: body.warehouseNumber ?? previous?.warehouseNumber ?? null,
    warehouseName: body.warehouseName ?? previous?.warehouseName ?? null,
    warehouseRef: body.warehouseRef ?? previous?.warehouseRef ?? null,
    street: body.street ?? previous?.street ?? null,
    building: body.building ?? previous?.building ?? null,
    apartment: body.apartment ?? previous?.apartment ?? null,
    notes: body.notes ?? previous?.notes ?? null,
    estimatedDeliveryAt: null,
    estimatedDaysMin: null,
    estimatedDaysMax: null,
    shippingCostMinor: null,
  };

  const deliveryEstimate = buildDeliveryEstimate(baseDelivery);
  const delivery: OrderDelivery = deliveryEstimate
    ? {
        ...baseDelivery,
        estimatedDeliveryAt: deliveryEstimate.estimatedDeliveryAt,
        estimatedDaysMin: deliveryEstimate.estimatedDaysMin,
        estimatedDaysMax: deliveryEstimate.estimatedDaysMax,
        shippingCostMinor: deliveryEstimate.shippingCostMinor,
      }
    : baseDelivery;

  return applyTotals({
    ...checkout,
    deliveryEstimate,
    order: {
      ...checkout.order,
      delivery,
    },
  });
}

export function cancelCheckout(
  checkout: WireCheckout,
  reason: NonNullable<WireCheckout['cancelledReason']> = 'user',
): WireCheckout {
  return {
    ...checkout,
    status: 'cancelled',
    cancelledReason: reason,
    isExpired: reason === 'expired',
  };
}

export function submitOrder(checkout: WireCheckout): WireOrder {
  const shippingCostMinor = checkout.deliveryEstimate?.shippingCostMinor;
  const { order } = checkout;

  return {
    ...order,
    status: 'new',
    cancelledReason: null,
    checkout: null,
    grandTotalMinor: shippingCostMinor != null ? order.totalMinor + shippingCostMinor : order.totalMinor,
  };
}
