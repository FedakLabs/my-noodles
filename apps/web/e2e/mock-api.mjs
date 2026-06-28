import { createServer } from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT ?? 3001);

const productId = '11111111-1111-4111-8111-111111111111';
const checkoutId = '22222222-2222-2222-2222-222222222222';
const orderId = '44444444-4444-4444-8444-444444444444';
const vsid = '33333333-3333-4333-8333-333333333333';

const productSummary = {
  id: productId,
  slug: 'pocky-matcha',
  name: 'Pocky Matcha',
  priceMinor: 9900,
  currency: 'UAH',
  images: ['https://example.com/pocky.jpg'],
  inStock: true,
  isTriedByUs: true,
  sortWeight: 10,
  brand: { slug: 'glico', name: 'Glico' },
  country: { slug: 'taiwan', code: 'TW', name: 'Тайвань' },
  category: { slug: 'snacks', name: 'Снеки' },
};

const productDetail = {
  ...productSummary,
  weight: '47g',
  description: 'Matcha-flavoured biscuit sticks.',
  story: 'A classic Japanese snack.',
  forWhom: 'Matcha lovers',
  flavor: { spice: 0, sweet: 3, texture: 'crispy' },
  allergens: ['milk'],
  alternatives: [],
};

const productsList = {
  items: [productSummary],
  meta: { total: 1, currentTotal: 1, page: 1, limit: 12 },
};

const productFacets = {
  total: 1,
  facets: {
    category: [{ value: 'snacks', label: 'Снеки', count: 1 }],
    brand: [{ value: 'glico', label: 'Glico', count: 1 }],
    price: { min: 9900, max: 9900 },
    isTriedByUs: 1,
    inStock: 1,
  },
};

const emptyCart = {
  items: [],
  totalMinor: 0,
  itemCount: 0,
  currency: 'UAH',
};

let cart = {
  items: [
    {
      productId,
      slug: 'pocky-matcha',
      title: 'Pocky Matcha',
      priceMinor: 9900,
      currency: 'UAH',
      imageUrl: 'https://example.com/pocky.jpg',
      qty: 1,
    },
  ],
  totalMinor: 9900,
  itemCount: 1,
  currency: 'UAH',
};

const stubCities = [
  { ref: 'city-kyiv', name: 'Київ' },
  { ref: 'city-lviv', name: 'Львів' },
  { ref: 'city-odesa', name: 'Одеса' },
];

const stubWarehouses = [
  { ref: 'wh-kyiv-1', number: '1', name: 'Відділення №1', address: 'вул. Центральна, 1' },
  { ref: 'wh-kyiv-2', number: '5', name: 'Відділення №5', address: 'просп. Перемоги, 12' },
];

function buildDeliveryEstimate(delivery) {
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

  const providerRates = {
    'nova-poshta': 6500,
    meest: 7500,
    ukrposhta: 5500,
  };

  return {
    estimatedDeliveryAt: '2025-06-22T00:00:00.000Z',
    estimatedDaysMin: 2,
    estimatedDaysMax: 3,
    shippingCostMinor: providerRates[delivery.provider] ?? 6500,
  };
}

let inProgressCheckouts = [];

const checkoutDetail = {
  id: checkoutId,
  orderId,
  status: 'in_progress',
  totalMinor: 9900,
  currency: 'UAH',
  firstName: null,
  lastName: null,
  phone: null,
  items: cart.items.map((item) => ({
    productId: item.productId,
    title: item.title,
    priceMinor: item.priceMinor,
    qty: item.qty,
  })),
  delivery: null,
  deliveryEstimate: null,
  createdAt: '2025-06-20T10:00:00.000Z',
  expiresAt: '2025-06-20T10:15:00.000Z',
};

function checkoutSummaryFromDetail() {
  return {
    id: checkoutDetail.id,
    orderId: checkoutDetail.orderId,
    status: checkoutDetail.status,
    itemCount: checkoutDetail.items.reduce((sum, item) => sum + item.qty, 0),
    totalMinor: checkoutDetail.totalMinor,
    currency: checkoutDetail.currency,
    updatedAt: checkoutDetail.createdAt,
    expiresAt: checkoutDetail.expiresAt,
  };
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
    'Access-Control-Allow-Credentials': 'true',
  });
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function routeRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
      'Access-Control-Allow-Credentials': 'true',
    });
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/api/health/live') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/products/facets') {
    sendJson(res, 200, productFacets);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    sendJson(res, 200, productsList);
    return;
  }

  if (req.method === 'GET' && pathname.startsWith('/api/products/')) {
    sendJson(res, 200, productDetail);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/cart') {
    sendJson(res, 200, cart);
    return;
  }

  if (req.method === 'DELETE' && pathname === '/api/cart') {
    cart = { ...emptyCart };
    sendJson(res, 200, cart);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/cart/items') {
    void parseBody(req).then((body) => {
      const qty = body.qty ?? 1;
      const existing = cart.items.find((item) => item.productId === body.productId);
      if (existing) {
        existing.qty += qty;
      } else {
        cart.items.push({
          productId: body.productId,
          slug: 'pocky-matcha',
          title: 'Pocky Matcha',
          priceMinor: 9900,
          currency: 'UAH',
          imageUrl: 'https://example.com/pocky.jpg',
          qty,
        });
      }
      cart.itemCount = cart.items.reduce((sum, item) => sum + item.qty, 0);
      cart.totalMinor = cart.items.reduce((sum, item) => sum + item.priceMinor * item.qty, 0);
      res.setHeader('Set-Cookie', `vsid=${vsid}; Path=/; HttpOnly`);
      sendJson(res, 201, cart);
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/delivery/providers') {
    sendJson(res, 200, [
      { id: 'nova-poshta', label: 'Нова Пошта' },
      { id: 'meest', label: 'Meest' },
      { id: 'ukrposhta', label: 'Укрпошта' },
    ]);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/delivery/cities') {
    const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const cities =
      query.length >= 2
        ? stubCities.filter((city) => city.name.toLowerCase().includes(query))
        : stubCities.slice(0, 5);
    sendJson(res, 200, cities);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/delivery/warehouses') {
    const cityRef = url.searchParams.get('cityRef') ?? '';
    const warehouses = cityRef.startsWith('city-kyiv') ? stubWarehouses : [];
    sendJson(res, 200, warehouses);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/checkouts') {
    const status = url.searchParams.get('status');
    const items =
      status === 'in_progress'
        ? inProgressCheckouts
        : inProgressCheckouts.filter((checkout) => !status || checkout.status === status);
    sendJson(res, 200, { items });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/checkouts') {
    checkoutDetail.items = cart.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      priceMinor: item.priceMinor,
      qty: item.qty,
    }));
    checkoutDetail.totalMinor = cart.totalMinor;
    checkoutDetail.status = 'in_progress';
    inProgressCheckouts = [checkoutSummaryFromDetail()];
    cart = { ...emptyCart };
    sendJson(res, 201, {
      id: checkoutId,
      orderId,
      status: 'in_progress',
      totalMinor: checkoutDetail.totalMinor,
      currency: checkoutDetail.currency,
      createdAt: checkoutDetail.createdAt,
    });
    return;
  }

  if (req.method === 'GET' && pathname === `/api/checkouts/${checkoutId}`) {
    if (checkoutDetail.status !== 'in_progress') {
      sendJson(res, 409, {
        identifier: 'checkout_not_in_progress',
        message: 'Checkout is no longer in progress',
        status: 409,
        payload: { checkoutId, status: checkoutDetail.status },
      });
      return;
    }
    sendJson(res, 200, checkoutDetail);
    return;
  }

  if (req.method === 'PATCH' && pathname === `/api/checkouts/${checkoutId}/receiver`) {
    void parseBody(req).then((body) => {
      if (body.firstName !== undefined) {
        checkoutDetail.firstName = body.firstName;
      }
      if (body.lastName !== undefined) {
        checkoutDetail.lastName = body.lastName;
      }
      if (body.phone !== undefined) {
        checkoutDetail.phone = body.phone;
      }
      sendJson(res, 200, checkoutDetail);
    });
    return;
  }

  if (req.method === 'PATCH' && pathname === `/api/checkouts/${checkoutId}/delivery`) {
    void parseBody(req).then((body) => {
      checkoutDetail.delivery = {
        provider: body.provider ?? checkoutDetail.delivery?.provider ?? 'nova-poshta',
        method: body.method ?? checkoutDetail.delivery?.method ?? 'warehouse',
        city: body.city ?? checkoutDetail.delivery?.city ?? null,
        cityRef: body.cityRef ?? checkoutDetail.delivery?.cityRef ?? null,
        warehouseNumber: body.warehouseNumber ?? checkoutDetail.delivery?.warehouseNumber ?? null,
        warehouseName: body.warehouseName ?? checkoutDetail.delivery?.warehouseName ?? null,
        warehouseRef: body.warehouseRef ?? checkoutDetail.delivery?.warehouseRef ?? null,
        street: body.street ?? checkoutDetail.delivery?.street ?? null,
        building: body.building ?? checkoutDetail.delivery?.building ?? null,
        apartment: body.apartment ?? checkoutDetail.delivery?.apartment ?? null,
        notes: body.notes ?? checkoutDetail.delivery?.notes ?? null,
      };
      checkoutDetail.deliveryEstimate = buildDeliveryEstimate(checkoutDetail.delivery);
      sendJson(res, 200, checkoutDetail);
    });
    return;
  }

  if (req.method === 'POST' && pathname === `/api/checkouts/${checkoutId}/submit`) {
    inProgressCheckouts = [];
    sendJson(res, 201, {
      id: orderId,
      status: 'new',
      totalMinor: 9900,
      currency: 'UAH',
      createdAt: checkoutDetail.createdAt,
    });
    return;
  }

  if (req.method === 'DELETE' && pathname === `/api/checkouts/${checkoutId}`) {
    inProgressCheckouts = [];
    checkoutDetail.status = 'cancelled';
    sendJson(res, 200, { ...checkoutDetail, status: 'cancelled' });
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
}

const server = createServer(routeRequest);

server.listen(PORT, () => {
  process.stdout.write(`mock api listening on http://127.0.0.1:${PORT}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
