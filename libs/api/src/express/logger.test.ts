import type { Request } from 'express';

import { buildIngoingManifestInput, resolveClientId, resolveRequestBody, resolveXRealIp } from './logger';

function createRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'get',
    originalUrl: '/api/health',
    url: '/api/health',
    path: '/api/health',
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as Request;
}

describe('express logger helpers', () => {
  it('resolves client id and real ip from headers', () => {
    const request = createRequest({
      headers: {
        'x-client-id': '1200997640',
        'x-real-ip': '91.196.55.1',
      },
    });

    expect(resolveClientId(request)).toBe('1200997640');
    expect(resolveXRealIp(request)).toBe('91.196.55.1');
  });

  it('serializes request bodies for any method when present', () => {
    const payload = { customerName: 'Ada' };

    expect(
      resolveRequestBody(
        createRequest({
          method: 'post',
          body: payload,
        }),
      ),
    ).toBe(JSON.stringify(payload));

    expect(
      resolveRequestBody(
        createRequest({
          method: 'get',
          body: payload,
        }),
      ),
    ).toBe(JSON.stringify(payload));

    expect(resolveRequestBody(createRequest({ method: 'delete', body: {} }))).toBe('{}');
    expect(resolveRequestBody(createRequest({ method: 'get' }))).toBeUndefined();
  });

  it('builds framework-agnostic ingoing manifest input from an Express request', () => {
    const orderPayload = { customerName: 'Ada' };
    const input = buildIngoingManifestInput(
      createRequest({
        method: 'post',
        originalUrl: '/api/orders?dryRun=1',
        url: '/api/orders?dryRun=1',
        path: '/api/orders',
        body: orderPayload,
        headers: {
          'x-client-id': 'client-1',
          'x-real-ip': '10.0.0.1',
        },
      }),
      {
        responseStatus: 201,
        execTimeMs: 18,
        responseBody: { id: '1' },
      },
    );

    expect(input).toEqual({
      method: 'POST',
      url: '/api/orders?dryRun=1',
      queryParams: 'dryRun=1',
      requestBody: JSON.stringify(orderPayload),
      responseStatus: 201,
      responseBody: { id: '1' },
      execTimeMs: 18,
      error: undefined,
      sanitizedMessage: undefined,
      clientId: 'client-1',
      xRealIp: '10.0.0.1',
    });
  });
});
