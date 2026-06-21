import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { type HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import type { Logger } from 'winston';

import { HttpExceptionLogFilter } from '@/infrastructure/logging';

import { jest } from '../jest-globals';

function createHost(request: Request, response: object = {}): ArgumentsHost {
  return {
    getType: () => 'http',
    getArgByIndex: () => undefined,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
}

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

describe('HttpExceptionLogFilter', () => {
  it('logs unhandled exceptions as manifest ERROR records', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const reply = jest.fn();
    const filter = new HttpExceptionLogFilter(
      {
        httpAdapter: {
          reply,
          isHeadersSent: () => false,
        },
      } as unknown as HttpAdapterHost,
      logger as unknown as Logger,
    );

    filter.catch(new Error('test'), createHost(createRequest(performance.now() - 5)));

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

  it('logs HttpException 4xx as manifest INFO records', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const reply = jest.fn();
    const filter = new HttpExceptionLogFilter(
      {
        httpAdapter: {
          reply,
          isHeadersSent: () => false,
        },
      } as unknown as HttpAdapterHost,
      logger as unknown as Logger,
    );

    filter.catch(
      new HttpException('Not found', HttpStatus.NOT_FOUND),
      createHost(createRequest(performance.now() - 3)),
    );

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
