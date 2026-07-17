import {
  AppException,
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@my-noodles/api-lib/exceptions';
import { ExceptionsFilter } from '@my-noodles/api-lib/nest';
import type { ArgumentsHost } from '@nestjs/common';
import {
  BadRequestException as NestBadRequestException,
  NotFoundException as NestNotFoundException,
} from '@nestjs/common';
import { type HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request } from 'express';
import type { Logger } from 'winston';

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

function createFilter(logger: { info: jest.Mock; error: jest.Mock }, reply: jest.Mock): ExceptionsFilter {
  return new ExceptionsFilter(
    {
      httpAdapter: {
        reply,
        isHeadersSent: () => false,
      },
    } as unknown as HttpAdapterHost,
    logger as unknown as Logger,
    { appName: 'test-api', appVersion: 'test' },
  );
}

describe('ExceptionsFilter', () => {
  it('logs and replies with ServerSideException for unhandled errors', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const reply = jest.fn();
    const filter = createFilter(logger, reply);
    const rawError = Object.assign(new Error('test'), { code: '23503' });

    filter.catch(rawError, createHost(createRequest(performance.now() - 5)));

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'ERROR',
        'severity.number': 17,
        body: 'GET /api/health 500 — Internal server error',
        'attributes.http.responseStatus': '500',
        'attributes.error.name': 'Error',
        'attributes.error.message': 'test',
        'attributes.http.responseBody': JSON.stringify({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'internal_server_error',
          message: 'Internal server error',
          payload: null,
        }),
      }),
    );

    const logged = logger.error.mock.calls[0]?.[0] as { 'attributes.error.raw': string };
    const raw = JSON.parse(logged['attributes.error.raw']) as { message: string; code: string };
    expect(raw.message).toBe('test');
    expect(raw.code).toBe('23503');
    expect(logger.info).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        code: 'internal_server_error',
        message: 'Internal server error',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('logs AppException 4xx as manifest INFO records and replies with toBody()', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const reply = jest.fn();
    const filter = createFilter(logger, reply);

    filter.catch(
      new AppException(HttpStatus.NOT_FOUND, 'not_found', 'Not found'),
      createHost(createRequest(performance.now() - 3)),
    );

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'INFO',
        body: 'GET /api/health 404',
        'attributes.http.responseStatus': '404',
      }),
    );
    expect(logger.error).not.toHaveBeenCalled();
    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      {
        status: HttpStatus.NOT_FOUND,
        code: 'not_found',
        message: 'Not found',
        payload: null,
      },
      HttpStatus.NOT_FOUND,
    );
  });

  it('maps Nest BadRequestException to BadRequestException', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const reply = jest.fn();
    const filter = createFilter(logger, reply);

    filter.catch(
      new NestBadRequestException({
        statusCode: 400,
        message: ['phone must be a valid phone number'],
        error: 'Bad Request',
      }),
      createHost(createRequest(performance.now() - 2)),
    );

    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      new BadRequestException('bad_request', 'phone must be a valid phone number').toBody(),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('maps Nest NotFoundException to our NotFoundException preset', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const reply = jest.fn();
    const filter = createFilter(logger, reply);

    filter.catch(
      new NestNotFoundException('Cannot GET /api/missing'),
      createHost(createRequest(performance.now() - 2)),
    );

    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      new NotFoundException('not_found', 'Cannot GET /api/missing').toBody(),
      HttpStatus.NOT_FOUND,
    );
  });

  it('maps ThrottlerException to TooManyRequestsException', () => {
    const logger = { info: jest.fn(), error: jest.fn() };
    const reply = jest.fn();
    const filter = createFilter(logger, reply);

    filter.catch(new ThrottlerException(), createHost(createRequest(performance.now() - 2)));

    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        code: 'too_many_requests',
        status: HttpStatus.TOO_MANY_REQUESTS,
      }),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  });
});
