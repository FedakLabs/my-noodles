import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

import type {
  AddCartItemDto,
  CartResponseDto,
  SubmitCheckoutDto,
  UpdateCheckoutDeliveryDto,
  UpdateCheckoutReceiverDto,
} from '@my-noodles/api-clients/storefront';

import {
  addToCart,
  cancelCheckout,
  createCheckoutFromCart,
  deliveryCities,
  deliveryProviders,
  deliveryWarehouses,
  emptyCart,
  healthLive,
  MOCK_IDS,
  MOCK_VSID,
  patchCheckoutDelivery,
  patchCheckoutReceiver,
  product,
  productFacets,
  productsList,
  submitOrder,
  type WireCheckout,
} from './fixtures/storefront.ts';

const PORT = Number(process.env.PORT ?? 3001);

let cart: CartResponseDto = emptyCart();
let checkout: WireCheckout | null = null;
let activeCheckouts: WireCheckout[] = [];

function resetStore(): void {
  cart = emptyCart();
  checkout = null;
  activeCheckouts = [];
}

function corsHeaders(req: IncomingMessage): Record<string, string> {
  // Must reflect Origin (not *) when the storefront uses credentials: 'include'.
  const origin = req.headers.origin ?? 'http://localhost:3000';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept-Language, x-app-locale',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

function sendJson(req: IncomingMessage, res: ServerResponse, statusCode: number, body: unknown): void {
  res.writeHead(statusCode, corsHeaders(req));
  res.end(JSON.stringify(body));
}

function parseBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer | string) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve((data ? JSON.parse(data) : {}) as T);
      } catch {
        resolve({} as T);
      }
    });
  });
}

function setVisitorCookie(res: ServerResponse): void {
  res.setHeader('Set-Cookie', `vsid=${MOCK_VSID}; Path=/; HttpOnly; SameSite=Lax`);
}

function routeRequest(req: IncomingMessage, res: ServerResponse): void {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
  const { pathname } = url;

  if (req.method === 'GET' && pathname === '/api/health/live') {
    sendJson(req, res, 200, healthLive);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/e2e/reset') {
    resetStore();
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  if (req.method === 'GET' && pathname === '/api/products/facets') {
    sendJson(req, res, 200, productFacets);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/products') {
    sendJson(req, res, 200, productsList);
    return;
  }

  if (req.method === 'GET' && pathname.startsWith('/api/products/')) {
    sendJson(req, res, 200, product);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/cart') {
    sendJson(req, res, 200, cart);
    return;
  }

  if (req.method === 'DELETE' && pathname === '/api/cart') {
    cart = emptyCart();
    sendJson(req, res, 200, cart);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/cart/items') {
    void parseBody<AddCartItemDto>(req).then((body) => {
      cart = addToCart(cart, body);
      setVisitorCookie(res);
      sendJson(req, res, 201, cart);
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/delivery/providers') {
    sendJson(req, res, 200, deliveryProviders);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/delivery/cities') {
    const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const cities = query ? deliveryCities.filter((city) => city.name.toLowerCase().includes(query)) : [];
    sendJson(req, res, 200, cities);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/delivery/warehouses') {
    const cityRef = url.searchParams.get('cityRef') ?? '';
    const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const warehouses =
      cityRef.startsWith('city-kyiv') && query
        ? deliveryWarehouses.filter((warehouse) => warehouse.name.toLowerCase().includes(query))
        : [];
    sendJson(req, res, 200, warehouses);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/checkouts') {
    const status = url.searchParams.get('status');
    const items =
      status === 'active'
        ? activeCheckouts
        : activeCheckouts.filter((entry) => !status || entry.status === status);
    sendJson(req, res, 200, items);
    return;
  }

  if (req.method === 'POST' && pathname === '/api/checkouts') {
    if (cart.items.length === 0) {
      sendJson(req, res, 409, {
        status: 409,
        code: 'cart_empty',
        message: 'Cart is empty',
        payload: {},
      });
      return;
    }

    checkout = createCheckoutFromCart(cart);
    activeCheckouts = [checkout];
    cart = emptyCart();
    setVisitorCookie(res);
    sendJson(req, res, 201, checkout);
    return;
  }

  if (req.method === 'GET' && pathname === `/api/checkouts/${MOCK_IDS.checkout}`) {
    if (!checkout) {
      sendJson(req, res, 404, {
        code: 'checkout_not_found',
        message: 'Checkout not found',
        status: 404,
        payload: { checkoutId: MOCK_IDS.checkout },
      });
      return;
    }
    sendJson(req, res, 200, checkout);
    return;
  }

  if (req.method === 'PATCH' && pathname === `/api/checkouts/${MOCK_IDS.checkout}/receiver`) {
    void parseBody<UpdateCheckoutReceiverDto>(req).then((body) => {
      if (!checkout) {
        sendJson(req, res, 404, { message: 'Not found' });
        return;
      }
      checkout = patchCheckoutReceiver(checkout, body);
      activeCheckouts = checkout.status === 'active' ? [checkout] : [];
      sendJson(req, res, 200, checkout);
    });
    return;
  }

  if (req.method === 'PATCH' && pathname === `/api/checkouts/${MOCK_IDS.checkout}/delivery`) {
    void parseBody<UpdateCheckoutDeliveryDto>(req).then((body) => {
      if (!checkout) {
        sendJson(req, res, 404, { message: 'Not found' });
        return;
      }
      checkout = patchCheckoutDelivery(checkout, body);
      activeCheckouts = checkout.status === 'active' ? [checkout] : [];
      sendJson(req, res, 200, checkout);
    });
    return;
  }

  if (req.method === 'POST' && pathname === `/api/checkouts/${MOCK_IDS.checkout}/submit`) {
    void parseBody<SubmitCheckoutDto>(req).then(() => {
      if (!checkout) {
        sendJson(req, res, 404, { message: 'Not found' });
        return;
      }
      const order = submitOrder(checkout);
      checkout = {
        ...checkout,
        status: 'completed',
        completedAt: new Date().toISOString(),
        order: { ...order, checkout: null },
      };
      activeCheckouts = [];
      sendJson(req, res, 201, order);
    });
    return;
  }

  if (req.method === 'GET' && pathname === `/api/orders/${MOCK_IDS.order}`) {
    if (!checkout || checkout.status !== 'completed') {
      sendJson(req, res, 404, {
        code: 'order_not_found',
        message: 'Order not found',
        status: 404,
        payload: { orderId: MOCK_IDS.order },
      });
      return;
    }
    sendJson(req, res, 200, checkout.order);
    return;
  }

  if (req.method === 'DELETE' && pathname === `/api/checkouts/${MOCK_IDS.checkout}`) {
    if (!checkout) {
      sendJson(req, res, 404, { message: 'Not found' });
      return;
    }
    checkout = cancelCheckout(checkout, 'user');
    activeCheckouts = [];
    sendJson(req, res, 200, checkout);
    return;
  }

  sendJson(req, res, 404, { message: 'Not found' });
}

const server = createServer(routeRequest);

server.listen(PORT, () => {
  process.stdout.write(`mock api listening on http://127.0.0.1:${PORT}\n`);
});

function shutdown(): void {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
