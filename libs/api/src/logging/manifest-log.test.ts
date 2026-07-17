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

  it('builds INFO access log with flat attributes and without request/response payloads', () => {
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
    expect(record['attributes.execTime']).toBe('12');
    expect(record['attributes.http.requestType']).toBe('ingoing');
    expect(record['attributes.http.method']).toBe('GET');
    expect(record['attributes.http.url']).toBe('/api/health');
    expect(record['attributes.http.route']).toBe('/health');
    expect(record['attributes.http.queryParams']).toBe('');
    expect(record['attributes.http.responseStatus']).toBe('200');
    expect(record['attributes.xRealIp']).toBe('127.0.0.1');
    expect(record['attributes.http.requestBody']).toBeUndefined();
    expect(record['attributes.http.responseBody']).toBeUndefined();
    expect(record).not.toHaveProperty('attributes');
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

    expect(record['attributes.http.url']).toBe('/api/products?limit=25&offset=0');
    expect(record['attributes.http.route']).toBe('/api/products/:id');
    expect(record['attributes.http.queryParams']).toBe('limit=25&offset=0');
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

    expect(record['attributes.http.requestBody']).toBe(JSON.stringify(orderPayload));
    expect(record['attributes.http.responseBody']).toBeUndefined();
  });

  it('uses INFO for 4xx client errors, omits error attributes, and keeps responseBody', () => {
    const responseBody = { status: 404, code: 'not_found', message: 'Not found', payload: null };
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 404,
      execTimeMs: 2,
      ...app,
      error: new Error('not found'),
      responseBody,
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['severity.number']).toBe(9);
    expect(record['attributes.error.name']).toBeUndefined();
    expect(record['attributes.error.message']).toBeUndefined();
    expect(record['attributes.error.stack']).toBeUndefined();
    expect(record['attributes.error.raw']).toBeUndefined();
    expect(record['attributes.http.responseBody']).toBe(JSON.stringify(responseBody));
  });

  it('includes responseBody on successful responses', () => {
    const responseBody = { items: [{ id: '1' }], total: 1 };
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 200,
      execTimeMs: 12,
      ...app,
      responseBody,
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['attributes.http.responseBody']).toBe(JSON.stringify(responseBody));
  });

  it('uses ERROR for 5xx with raw exception details and falls back body message to raw', () => {
    const error = Object.assign(new Error('fk violation'), { code: '23503', constraint: 'users_fkey' });
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 500,
      execTimeMs: 2,
      ...app,
      error,
      responseBody: {
        status: 500,
        code: 'internal_server_error',
        message: 'Internal server error',
        payload: null,
      },
    });

    expect(record['severity.text']).toBe('ERROR');
    expect(record['severity.number']).toBe(17);
    expect(record.body).toBe('GET /api/health 500 — fk violation');
    expect(record['attributes.error.name']).toBe('Error');
    expect(record['attributes.error.message']).toBe('fk violation');
    expect(record['attributes.error.stack']).toContain('fk violation');

    const raw = JSON.parse(record['attributes.error.raw']!) as Record<string, unknown>;
    expect(raw.name).toBe('Error');
    expect(raw.message).toBe('fk violation');
    expect(raw.code).toBe('23503');
    expect(raw.constraint).toBe('users_fkey');
    expect(raw.stack).toEqual(expect.any(String));

    expect(record['attributes.http.responseBody']).toBe(
      JSON.stringify({
        status: 500,
        code: 'internal_server_error',
        message: 'Internal server error',
        payload: null,
      }),
    );
  });

  it('uses sanitizedMessage for the body summary line on 5xx', () => {
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 500,
      execTimeMs: 2,
      ...app,
      error: new Error('fk violation'),
      sanitizedMessage: 'Internal server error',
      responseBody: {
        status: 500,
        code: 'internal_server_error',
        message: 'Internal server error',
        payload: null,
      },
    });

    expect(record.body).toBe('GET /api/health 500 — Internal server error');
    expect(record['attributes.error.message']).toBe('fk violation');
  });

  it('always includes error.raw for 5xx errors', () => {
    const record = buildHttpAccessLog({
      request: createRequest(),
      statusCode: 500,
      execTimeMs: 2,
      ...app,
      error: new Error('test'),
    });

    expect(record['attributes.error.name']).toBe('Error');
    expect(record['attributes.error.message']).toBe('test');

    const raw = JSON.parse(record['attributes.error.raw']!) as { name: string; message: string };
    expect(raw.name).toBe('Error');
    expect(raw.message).toBe('test');
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

    expect(record['attributes.clientId']).toBe('1200997640');
    expect(record['attributes.xRealIp']).toBe('91.196.55.1');
  });
});
