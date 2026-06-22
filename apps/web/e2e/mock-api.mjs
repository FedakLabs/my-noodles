import { createServer } from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT ?? 3001);

const productId = '11111111-1111-4111-8111-111111111111';

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
    country: [{ value: 'taiwan', label: 'Тайвань', count: 1 }],
    price: { min: 9900, max: 9900 },
    isTriedByUs: 1,
    inStock: 1,
  },
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
  });
  res.end(JSON.stringify(body));
}

function routeRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept-Language',
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

  if (req.method === 'POST' && pathname === '/api/orders') {
    sendJson(res, 201, {
      id: '22222222-2222-2222-2222-222222222222',
      status: 'new',
      totalMinor: 9900,
      currency: 'UAH',
      createdAt: '2025-06-20T10:00:00.000Z',
    });
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
