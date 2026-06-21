import type { Request } from 'express';

import { buildHttpAccessLog, resolveClientId, resolveHttpRoute, resolveXRealIp } from './manifest-log';

function createRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'get',
    originalUrl: '/api/health',
    url: '/api/health',
    path: '/api/health',
    route: { path: '/health' },
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as Request;
}

describe('buildHttpAccessLog', () => {
  const app = { appName: 'my-noodles-api', appVersion: 'dev' };

  it('builds INFO access log without request/response payloads', () => {
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 200,
      execTimeMs: 12.4,
      ...app,
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['severity.number']).toBe(9);
    expect(record['resource.appName']).toBe('my-noodles-api');
    expect(record['resource.appVersion']).toBe('dev');
    expect(record.body).toBe('GET /api/health 200');
    expect(record.attributes).toEqual({
      'attributes.execTime': '12',
      'attributes.http.requestType': 'ingoing',
      'attributes.http.method': 'GET',
      'attributes.http.url': '/api/health',
      'attributes.http.route': '/health',
      'attributes.http.queryParams': '',
      'attributes.http.responseStatus': '200',
      'attributes.xRealIp': '127.0.0.1',
    });
    expect(record.attributes['attributes.http.requestBody']).toBeUndefined();
    expect(record.attributes['attributes.http.responseBody']).toBeUndefined();
  });

  it('includes query params and route template', () => {
    const record = buildHttpAccessLog({
      request: createRequest({
        originalUrl: '/api/products?limit=25&offset=0',
        url: '/api/products?limit=25&offset=0',
        path: '/api/products',
        route: { path: '/api/products/:id' },
      }),
      statusCode: 404,
      execTimeMs: 3,
      ...app,
    });

    expect(record.attributes['attributes.http.url']).toBe('/api/products?limit=25&offset=0');
    expect(record.attributes['attributes.http.route']).toBe('/api/products/:id');
    expect(record.attributes['attributes.http.queryParams']).toBe('limit=25&offset=0');
    expect(record.body).toBe('GET /api/products?limit=25&offset=0 404');
  });

  it('uses Nest route template when available', () => {
    expect(
      resolveHttpRoute(
        createRequest({
          path: '/api/health',
          route: { path: '/api/health' },
        }),
      ),
    ).toBe('/api/health');

    expect(
      resolveHttpRoute(
        createRequest({
          path: '/api/health',
          route: { path: '/health' },
        }),
      ),
    ).toBe('/health');
  });

  it('includes POST request body for OTEL access logs', () => {
    const orderPayload = {
      customerName: 'Ada',
      phone: '+380501234567',
      delivery: { provider: 'nova-poshta', method: 'warehouse', city: 'Kyiv', warehouseNumber: '1' },
      items: [{ productId: '11111111-1111-1111-1111-111111111111', qty: 2 }],
    };

    const record = buildHttpAccessLog({
      request: createRequest({
        method: 'post',
        originalUrl: '/api/orders',
        url: '/api/orders',
        path: '/api/orders',
        route: { path: '/orders' },
        body: orderPayload,
      }),
      statusCode: 201,
      execTimeMs: 18,
      ...app,
    });

    expect(record.attributes['attributes.http.requestBody']).toBe(JSON.stringify(orderPayload));
    expect(record.attributes['attributes.http.responseBody']).toBeUndefined();
  });

  it('uses INFO for 4xx client errors', () => {
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 404,
      execTimeMs: 2,
      ...app,
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['severity.number']).toBe(9);
  });

  it('uses ERROR for 5xx with exception details', () => {
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 500,
      execTimeMs: 2,
      ...app,
      error: new Error('test'),
    });

    expect(record['severity.text']).toBe('ERROR');
    expect(record['severity.number']).toBe(17);
    expect(record.body).toBe('GET /api/health 500 — test');
    expect(record.attributes['attributes.error.name']).toBe('Error');
    expect(record.attributes['attributes.error.message']).toBe('test');
  });

  it('adds client and ip attributes when present', () => {
    const request = createRequest({
      headers: {
        'x-client-id': '1200997640',
        'x-real-ip': '91.196.55.1',
      },
    });

    expect(resolveClientId(request)).toBe('1200997640');
    expect(resolveXRealIp(request)).toBe('91.196.55.1');
    expect(resolveHttpRoute(request)).toBe('/health');

    const record = buildHttpAccessLog({
      request,
      statusCode: 200,
      execTimeMs: 1,
      ...app,
    });

    expect(record.attributes['attributes.clientId']).toBe('1200997640');
    expect(record.attributes['attributes.xRealIp']).toBe('91.196.55.1');
  });
});
