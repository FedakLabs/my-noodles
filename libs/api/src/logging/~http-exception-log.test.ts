import type { Request } from 'express';

import { HttpExceptionLog } from './http-exception-log';

function createRequest(startTimeMs: number): Request {
  return {
    method: 'GET',
    originalUrl: '/api/health',
    url: '/api/health',
    path: '/api/health',
    route: { path: '/health' },
    headers: {},
    ip: '127.0.0.1',
    startTimeMs,
  } as unknown as Request;
}

describe('HttpExceptionLog', () => {
  const resource = { appName: 'my-noodles-api', appVersion: 'dev' };

  it('logs unhandled exceptions as manifest ERROR records', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const exceptionLog = new HttpExceptionLog(logger as never, resource);

    exceptionLog.log(createRequest(performance.now() - 5), new Error('test'));

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'ERROR',
        'severity.number': 17,
        body: 'GET /api/health 500 — test',
        attributes: expect.objectContaining({
          'attributes.http.responseStatus': '500',
          'attributes.error.message': 'test',
        }) as Record<string, string>,
      }),
    );
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('logs 4xx status exceptions as manifest INFO records', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const exceptionLog = new HttpExceptionLog(logger as never, resource);

    exceptionLog.log(createRequest(performance.now() - 3), {
      getStatus: () => 404,
      getResponse: () => 'Not found',
      name: 'NotFoundException',
    });

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'INFO',
        body: 'GET /api/health 404',
        attributes: expect.objectContaining({
          'attributes.http.responseStatus': '404',
        }) as Record<string, string>,
      }),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});
