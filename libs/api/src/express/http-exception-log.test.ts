import type { Request } from 'express';

import { configureAppLogger, logger } from '../logger';
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
  beforeAll(() => {
    configureAppLogger({
      appName: 'my-noodles-api',
      appVersion: 'dev',
      nodeEnv: 'local',
      otel: { enabled: false },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs unhandled exceptions as manifest ERROR records with raw error fields', () => {
    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);
    const exceptionLog = new HttpExceptionLog();
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

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'ERROR',
        'severity.number': 17,
        body: expect.stringMatching(/^GET 500 \d+ms \/api\/health — Internal server error$/),
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

    const logged = errorSpy.mock.calls[0]?.[0] as { 'attributes.error.raw': string };
    const raw = JSON.parse(logged['attributes.error.raw']) as { message: string; code: string };
    expect(raw.message).toBe('fk violation');
    expect(raw.code).toBe('23503');
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('logs 4xx status exceptions as manifest INFO records', () => {
    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);
    const exceptionLog = new HttpExceptionLog();

    exceptionLog.log(createRequest(performance.now() - 3), {
      getStatus: () => 404,
      getResponse: () => 'Not found',
      name: 'NotFoundException',
    });

    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'INFO',
        body: expect.stringMatching(/^GET 404 \d+ms \/api\/health$/),
        'attributes.http.responseStatus': '404',
      }),
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('resolves status from a numeric status field on raw AppException-like errors', () => {
    const exceptionLog = new HttpExceptionLog();

    expect(exceptionLog.resolveStatusCode({ status: 409, message: 'conflict' })).toBe(409);
  });
});
