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

  it('logs unhandled exceptions as manifest ERROR records with raw error fields', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const exceptionLog = new HttpExceptionLog(logger as never, resource);
    const rawError = Object.assign(new Error('fk violation'), { code: '23503' });

    exceptionLog.log(createRequest(performance.now() - 5), rawError, {
      statusCode: 500,
      sanitizedMessage: 'Internal server error',
      responseBody: {
        status: 500,
        code: 'internal_server_error',
        message: 'Internal server error',
        payload: null,
      },
    });

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'ERROR',
        'severity.number': 17,
        body: 'GET /api/health 500 — Internal server error',
        'attributes.http.responseStatus': '500',
        'attributes.error.name': 'Error',
        'attributes.error.message': 'fk violation',
        'attributes.http.responseBody': JSON.stringify({
          status: 500,
          code: 'internal_server_error',
          message: 'Internal server error',
          payload: null,
        }),
      }),
    );

    const logged = logger.error.mock.calls[0]?.[0] as { 'attributes.error.raw': string };
    const raw = JSON.parse(logged['attributes.error.raw']) as { message: string; code: string };
    expect(raw.message).toBe('fk violation');
    expect(raw.code).toBe('23503');
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
        'attributes.http.responseStatus': '404',
      }),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('resolves status from a numeric status field on raw AppException-like errors', () => {
    const exceptionLog = new HttpExceptionLog({ info: jest.fn(), error: jest.fn() } as never, resource);

    expect(exceptionLog.resolveStatusCode({ status: 409, message: 'conflict' })).toBe(409);
  });
});
