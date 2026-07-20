import {
  AppException,
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@my-noodles/api-lib/exceptions';
import { logger } from '@my-noodles/api-lib/logger';
import { ExceptionsFilter } from '@my-noodles/api-lib/nest';
import type { ArgumentsHost } from '@nestjs/common';
import {
  BadRequestException as NestBadRequestException,
  NotFoundException as NestNotFoundException,
} from '@nestjs/common';
import { type HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request } from 'express';

import { afterEach, beforeEach, jest } from '../jest-globals';

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

function createFilter(reply: jest.Mock): ExceptionsFilter {
  return new ExceptionsFilter({
    httpAdapter: {
      reply,
      isHeadersSent: () => false,
    },
  } as unknown as HttpAdapterHost);
}

describe('ExceptionsFilter', () => {
  let infoSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);
  });

  afterEach(() => {
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs and replies with ServerSideException for unhandled errors', () => {
    const reply = jest.fn();
    const filter = createFilter(reply);
    const rawError = Object.assign(new Error('test'), { code: '23503' });

    filter.catch(rawError, createHost(createRequest(performance.now() - 5)));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'ERROR',
        'severity.number': 17,
        body: expect.stringMatching(/^GET 500 \d+ms \/api\/health — Internal server error$/),
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

    const logged = errorSpy.mock.calls[0]?.[0] as { 'attributes.error.raw': string };
    const raw = JSON.parse(logged['attributes.error.raw']) as { message: string; code: string };
    expect(raw.message).toBe('test');
    expect(raw.code).toBe('23503');
    expect(infoSpy).not.toHaveBeenCalled();
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
    const reply = jest.fn();
    const filter = createFilter(reply);

    filter.catch(
      new AppException({ status: HttpStatus.NOT_FOUND, code: 'not_found', message: 'Not found' }),
      createHost(createRequest(performance.now() - 3)),
    );

    expect(infoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        'severity.text': 'INFO',
        body: expect.stringMatching(/^GET 404 \d+ms \/api\/health$/),
        'attributes.http.responseStatus': '404',
      }),
    );
    expect(errorSpy).not.toHaveBeenCalled();
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

  it('keeps internal off the HTTP body while writing it to error.raw', () => {
    const reply = jest.fn();
    const filter = createFilter(reply);
    const internal = { providerStatus: 503, detail: 'upstream timeout' };

    filter.catch(
      new AppException({
        status: HttpStatus.BAD_GATEWAY,
        code: 'upstream_failed',
        message: 'Upstream failed',
        payload: { reason: 'temporary' },
        internal,
      }),
      createHost(createRequest(performance.now() - 2)),
    );

    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      {
        status: HttpStatus.BAD_GATEWAY,
        code: 'upstream_failed',
        message: 'Upstream failed',
        payload: { reason: 'temporary' },
      },
      HttpStatus.BAD_GATEWAY,
    );

    const logged = errorSpy.mock.calls[0]?.[0] as { 'attributes.error.raw': string };
    expect(JSON.parse(logged['attributes.error.raw'])).toEqual(internal);
  });

  it('maps Nest BadRequestException to BadRequestException', () => {
    const reply = jest.fn();
    const filter = createFilter(reply);

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
      new BadRequestException({
        code: 'bad_request',
        message: 'phone must be a valid phone number',
      }).toBody(),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('maps Nest NotFoundException to our NotFoundException preset', () => {
    const reply = jest.fn();
    const filter = createFilter(reply);

    filter.catch(
      new NestNotFoundException('Cannot GET /api/missing'),
      createHost(createRequest(performance.now() - 2)),
    );

    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      new NotFoundException({ code: 'not_found', message: 'Cannot GET /api/missing' }).toBody(),
      HttpStatus.NOT_FOUND,
    );
  });

  it('maps ThrottlerException to TooManyRequestsException', () => {
    const reply = jest.fn();
    const filter = createFilter(reply);

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
