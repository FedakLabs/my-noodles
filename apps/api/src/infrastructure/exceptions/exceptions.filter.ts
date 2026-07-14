import {
  AppException,
  NotFoundException as AppNotFoundException,
  ServerSideException,
  ServiceUnavailableException as AppServiceUnavailableException,
  TooManyRequestsException,
  ValidationException,
} from '@my-noodles/api-lib/exceptions';
import { APP_LOGGER, HttpExceptionLog } from '@my-noodles/api-lib/logging';
import {
  type ArgumentsHost,
  BadRequestException as NestBadRequestException,
  Catch,
  type ExceptionFilter,
  HttpException,
  Inject,
  Injectable,
  NotFoundException as NestNotFoundException,
  ServiceUnavailableException as NestServiceUnavailableException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request } from 'express';
import type { Logger } from 'winston';

import { config } from '@/config';

@Catch()
@Injectable()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly exceptionLog: HttpExceptionLog;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(APP_LOGGER) logger: Logger,
  ) {
    this.exceptionLog = new HttpExceptionLog(logger, {
      appName: config.appName,
      appVersion: config.appVersion,
    });
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const appException = this.toAppException(exception);

    this.exceptionLog.log(ctx.getRequest<Request>(), appException);
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
      return new ValidationException(extractValidationErrors(response));
    }

    if (exception instanceof NestNotFoundException) {
      return new AppNotFoundException('not_found', message || 'Not found');
    }

    if (exception instanceof ThrottlerException) {
      return new TooManyRequestsException(message || 'Too many requests');
    }

    if (exception instanceof NestServiceUnavailableException) {
      return new AppServiceUnavailableException(message || undefined);
    }

    return new AppException(exception.getStatus(), 'request_failed', message || 'Request failed');
  }
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

function extractValidationErrors(response: string | object): string[] {
  if (typeof response === 'string') {
    return response.length > 0 ? [response] : ['Bad Request'];
  }

  if (typeof response === 'object' && response !== null && 'message' in response) {
    const { message } = response as { message?: unknown };

    if (Array.isArray(message)) {
      return message.map(String);
    }

    if (typeof message === 'string' && message.length > 0) {
      return [message];
    }
  }

  return ['Bad Request'];
}
