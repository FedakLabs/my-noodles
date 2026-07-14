import type { Request } from 'express';

import { HttpAccessLog } from './http-access-log';
import { getRequestStartTimeMs } from './request-timing';

describe('HttpAccessLog', () => {
  const resource = { appName: 'my-noodles-api', appVersion: 'dev' };

  it('marks request start time and logs successful responses', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const accessLog = new HttpAccessLog(logger as never, resource);
    const request = {
      method: 'GET',
      originalUrl: '/api/health',
      url: '/api/health',
      path: '/api/health',
      route: { path: '/health' },
      headers: {},
      ip: '127.0.0.1',
    } as unknown as Request;

    const started = accessLog.markRequestStart(request);

    expect(getRequestStartTimeMs(request)).toBe(started);
    accessLog.logSuccess(request, 200, started);

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'INFO',
        body: 'GET /api/health 200',
        attributes: expect.objectContaining({
          'attributes.http.requestType': 'ingoing',
          'attributes.http.method': 'GET',
          'attributes.http.responseStatus': '200',
        }) as Record<string, string>,
      }),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});
