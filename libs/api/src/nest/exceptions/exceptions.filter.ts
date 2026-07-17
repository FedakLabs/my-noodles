import {
  type ArgumentsHost,
  BadRequestException as NestBadRequestException,
  Catch,
  type ExceptionFilter,
  HttpException,
  Injectable,
  NotFoundException as NestNotFoundException,
  ServiceUnavailableException as NestServiceUnavailableException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request } from 'express';
import type { Logger } from 'winston';

import {
  AppException,
  BadRequestException,
  HttpStatus,
  NotFoundException as AppNotFoundException,
  ServerSideException,
  ServiceUnavailableException,
  TooManyRequestsException,
} from '../../exceptions';
import { HttpExceptionLog } from '../../logging';
import type { HttpAccessLogResource } from '../../logging/http-access-log';

@Catch()
@Injectable()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly exceptionLog: HttpExceptionLog;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    logger: Logger,
    metadata: HttpAccessLogResource,
  ) {
    this.exceptionLog = new HttpExceptionLog(logger, metadata);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const appException = this.toAppException(exception);

    this.exceptionLog.log(ctx.getRequest<Request>(), exception, {
      statusCode: appException.status,
      responseBody: appException.toBody(),
      sanitizedMessage: appException.message,
    });
    httpAdapter.reply(ctx.getResponse(), appException.toBody(), appException.status);
  }

  private toAppException(exception: unknown): AppException<unknown> {
    if (exception instanceof AppException) {
      return exception;
    }

    if (exception instanceof HttpException) {
      return this.fromNest(exception);
    }

    return new ServerSideException();
  }

  private fromNest(exception: HttpException): AppException<unknown> {
    const response = exception.getResponse();
    const message = extractNestMessage(response);

    if (exception instanceof NestBadRequestException) {
      return new BadRequestException('bad_request', message || 'Bad Request');
    }

    if (exception instanceof NestNotFoundException) {
      return new AppNotFoundException('not_found', message || 'Not found');
    }

    if (isThrottlerException(exception)) {
      return new TooManyRequestsException(message || 'Too many requests');
    }

    if (exception instanceof NestServiceUnavailableException) {
      return new ServiceUnavailableException(message || undefined);
    }

    return new AppException(exception.getStatus(), 'request_failed', message || 'Request failed');
  }
}

function isThrottlerException(exception: HttpException): boolean {
  return (
    exception instanceof ThrottlerException ||
    (exception.getStatus() === HttpStatus.TOO_MANY_REQUESTS &&
      exception.constructor.name === 'ThrottlerException')
  );
}

function extractNestMessage(response: string | object): string {
  if (typeof response === 'string') {
    return response;
  }

  if (typeof response === 'object' && response !== null && 'message' in response) {
    const { message } = response as { message?: unknown };

    if (Array.isArray(message)) {
      return message.map(String).join('; ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return '';
}
