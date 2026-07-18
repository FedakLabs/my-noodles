import type { Request } from 'express';

import { getTimingStartMs } from '../api-client/request-timing';
import { configureAppLogger, logger } from '../logger';
import { HttpAccessLog } from './http-access-log';

describe('HttpAccessLog', () => {
  beforeAll(() => {
    configureAppLogger({
      appName: 'my-noodles-api',
      appVersion: 'dev',
      nodeEnv: 'local',
      otel: { enabled: false },
    });
  });

  it('marks request start time and logs successful responses', () => {
    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);
    const accessLog = new HttpAccessLog();
    const request = {
      method: 'GET',
      originalUrl: '/api/health',
      url: '/api/health',
      path: '/api/health',
      route: { path: '/health' },
      headers: {},
      ip: '127.0.0.1',
    } as unknown as Request;

    try {
      const started = accessLog.markRequestStart(request);

      expect(getTimingStartMs(request)).toBe(started);
      accessLog.logSuccess(request, 200, started, { status: 'ok' });

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          'severity.text': 'INFO',
          body: expect.stringMatching(/^GET 200 \d+ms \/api\/health$/),
          'attributes.http.requestType': 'ingoing',
          'attributes.http.method': 'GET',
          'attributes.http.responseStatus': '200',
          'attributes.http.responseBody': JSON.stringify({ status: 'ok' }),
        }),
      );
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      infoSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
