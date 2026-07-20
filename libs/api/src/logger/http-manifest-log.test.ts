import { AppException, HttpStatus, ServerSideException } from '../exceptions';
import { buildIngoingHttpManifestLog, buildOutgoingHttpManifestLog } from './http-manifest-log';
import { LogMetadata } from './log-metadata';

beforeAll(() => {
  LogMetadata.set({ appName: 'my-noodles-api', appVersion: 'dev' });
});

describe('buildIngoingHttpManifestLog', () => {
  it('builds INFO access log with flat attributes and without request/response payloads', () => {
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      queryParams: '',
      responseStatus: 200,
      execTimeMs: 12.4,
      xRealIp: '127.0.0.1',
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['severity.number']).toBe(9);
    expect(record['resource.appName']).toBe('my-noodles-api');
    expect(record['resource.appVersion']).toBe('dev');
    expect(record.body).toBe('GET 200 12ms /api/health');
    expect(record['attributes.execTime']).toBe('12');
    expect(record['attributes.http.requestType']).toBe('ingoing');
    expect(record['attributes.http.method']).toBe('GET');
    expect(record['attributes.http.url']).toBe('/api/health');
    expect(record['attributes.http.queryParams']).toBe('');
    expect(record['attributes.http.responseStatus']).toBe('200');
    expect(record['attributes.xRealIp']).toBe('127.0.0.1');
    expect(record['attributes.http.requestBody']).toBeUndefined();
    expect(record['attributes.http.responseBody']).toBeUndefined();
    expect(record).not.toHaveProperty('attributes');
  });

  it('includes query params', () => {
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/products?limit=25&offset=0',
      queryParams: 'limit=25&offset=0',
      responseStatus: 404,
      execTimeMs: 3,
    });

    expect(record['attributes.http.url']).toBe('/api/products?limit=25&offset=0');
    expect(record['attributes.http.queryParams']).toBe('limit=25&offset=0');
    expect(record.body).toBe('GET 404 3ms /api/products?limit=25&offset=0');
  });

  it('includes POST request body for OTEL access logs', () => {
    const orderPayload = {
      customerName: 'Ada',
      phone: '+380501234567',
      delivery: { provider: 'nova-poshta', method: 'warehouse', city: 'Kyiv', warehouseNumber: '1' },
      items: [{ productId: '11111111-1111-1111-1111-111111111111', qty: 2 }],
    };

    const record = buildIngoingHttpManifestLog({
      method: 'POST',
      url: '/api/orders',
      requestBody: JSON.stringify(orderPayload),
      responseStatus: 201,
      execTimeMs: 18,
    });

    expect(record['attributes.http.requestBody']).toBe(JSON.stringify(orderPayload));
    expect(record['attributes.http.responseBody']).toBeUndefined();
  });

  it('uses INFO for 4xx client errors, omits error attributes, and keeps responseBody', () => {
    const responseBody = { status: 404, code: 'not_found', message: 'Not found', payload: null };
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 404,
      execTimeMs: 2,
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
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 200,
      execTimeMs: 12,
      responseBody,
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['attributes.http.responseBody']).toBe(JSON.stringify(responseBody));
  });

  it('uses ERROR for 5xx with raw exception details and falls back body message to raw', () => {
    const error = Object.assign(new Error('fk violation'), { code: '23503', constraint: 'users_fkey' });
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 500,
      execTimeMs: 2,
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
    expect(record.body).toBe('GET 500 2ms /api/health — fk violation');
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
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 500,
      execTimeMs: 2,
      error: new Error('fk violation'),
      sanitizedMessage: 'Internal server error',
      responseBody: {
        status: 500,
        code: 'internal_server_error',
        message: 'Internal server error',
        payload: null,
      },
    });

    expect(record.body).toBe('GET 500 2ms /api/health — Internal server error');
    expect(record['attributes.error.message']).toBe('fk violation');
  });

  it('always includes error.raw for 5xx errors', () => {
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 500,
      execTimeMs: 2,
      error: new Error('test'),
    });

    expect(record['attributes.error.name']).toBe('Error');
    expect(record['attributes.error.message']).toBe('test');

    const raw = JSON.parse(record['attributes.error.raw']!) as { name: string; message: string };
    expect(raw.name).toBe('Error');
    expect(raw.message).toBe('test');
  });

  it('writes AppException.internal to error.raw and prefers Error cause for name/message/stack', () => {
    const cause = Object.assign(new Error('fk violation'), { code: '23503' });
    const error = new ServerSideException({ internal: cause });
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 500,
      execTimeMs: 2,
      error,
      sanitizedMessage: error.message,
      responseBody: error.toBody(),
    });

    expect(record['attributes.error.name']).toBe('Error');
    expect(record['attributes.error.message']).toBe('fk violation');
    expect(record['attributes.error.stack']).toContain('fk violation');
    expect(JSON.parse(record['attributes.error.raw']!)).toMatchObject({
      message: 'fk violation',
      code: '23503',
    });
    expect(record['attributes.http.responseBody']).toBe(JSON.stringify(error.toBody()));
    expect(error.toBody()).not.toHaveProperty('internal');
  });

  it('emits error.raw from internal on INFO when AppException carries non-Error internal', () => {
    const internal = { message: 'Not found' };
    const error = new AppException({
      status: HttpStatus.NOT_FOUND,
      code: 'api_client_error',
      message: 'Not found',
      internal,
    });
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 404,
      execTimeMs: 2,
      error,
      responseBody: error.toBody(),
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['attributes.error.name']).toBeUndefined();
    expect(JSON.parse(record['attributes.error.raw']!)).toEqual(internal);
  });

  it('adds client and ip attributes when present', () => {
    const record = buildIngoingHttpManifestLog({
      method: 'GET',
      url: '/api/health',
      responseStatus: 200,
      execTimeMs: 1,
      clientId: '1200997640',
      xRealIp: '91.196.55.1',
    });

    expect(record['attributes.clientId']).toBe('1200997640');
    expect(record['attributes.xRealIp']).toBe('91.196.55.1');
  });
});

describe('buildOutgoingHttpManifestLog', () => {
  it('builds INFO outgoing access log with service and requestType', () => {
    const record = buildOutgoingHttpManifestLog({
      method: 'POST',
      url: 'https://api.novaposhta.ua/v2.0/json/',
      queryParams: '',
      requestBody: '{"CityName":"Kyiv"}',
      responseStatus: 200,
      responseBody: { success: true, data: [] },
      execTimeMs: 42.6,
      serviceName: 'NovaPoshtaApi',
    });

    expect(record['severity.text']).toBe('INFO');
    expect(record['severity.number']).toBe(9);
    expect(record.body).toBe('POST 200 43ms https://api.novaposhta.ua/v2.0/json/');
    expect(record['attributes.http.requestType']).toBe('outgoing');
    expect(record['attributes.http.method']).toBe('POST');
    expect(record['attributes.http.service']).toBe('NovaPoshtaApi');
    expect(record['attributes.http.responseStatus']).toBe('200');
    expect(record['attributes.http.requestBody']).toBe('{"CityName":"Kyiv"}');
    expect(record['attributes.http.responseBody']).toBe(JSON.stringify({ success: true, data: [] }));
  });

  it('uses INFO for upstream 4xx and ERROR for upstream 5xx or 2xx app-level failures', () => {
    const clientError = buildOutgoingHttpManifestLog({
      method: 'GET',
      url: 'https://example.com/items',
      responseStatus: 404,
      execTimeMs: 10,
      error: new Error('Not found'),
      serviceName: 'ExampleApi',
    });

    expect(clientError['severity.text']).toBe('INFO');
    expect(clientError['attributes.error.name']).toBeUndefined();

    const serverError = buildOutgoingHttpManifestLog({
      method: 'GET',
      url: 'https://example.com/items',
      responseStatus: 502,
      execTimeMs: 10,
      error: new Error('Bad gateway'),
      serviceName: 'ExampleApi',
    });

    expect(serverError['severity.text']).toBe('ERROR');
    expect(serverError['severity.number']).toBe(17);
    expect(serverError.body).toBe('GET 502 10ms https://example.com/items — Bad gateway');
    expect(serverError['attributes.error.message']).toBe('Bad gateway');

    const appLevelError = buildOutgoingHttpManifestLog({
      method: 'POST',
      url: 'https://api.novaposhta.ua/v2.0/json/',
      responseStatus: 200,
      responseBody: { success: false, errors: ['FindByString is not specified'] },
      execTimeMs: 10,
      error: new Error('FindByString is not specified'),
      serviceName: 'NovaPoshtaApi',
    });

    expect(appLevelError['severity.text']).toBe('ERROR');
    expect(appLevelError['attributes.error.message']).toBe('FindByString is not specified');
    expect(appLevelError['attributes.http.responseStatus']).toBe('200');
  });

  it('treats network failures without status as ERROR', () => {
    const record = buildOutgoingHttpManifestLog({
      method: 'POST',
      url: 'https://api.novaposhta.ua/v2.0/json/',
      execTimeMs: 5,
      error: new Error('fetch failed'),
      serviceName: 'NovaPoshtaApi',
    });

    expect(record['severity.text']).toBe('ERROR');
    expect(record.body).toBe('POST - 5ms https://api.novaposhta.ua/v2.0/json/ — fetch failed');
    expect(record['attributes.http.responseStatus']).toBeUndefined();
    expect(record['attributes.error.message']).toBe('fetch failed');
    expect(record['attributes.http.service']).toBe('NovaPoshtaApi');
  });
});
