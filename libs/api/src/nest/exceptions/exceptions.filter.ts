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

import {
  AppException,
  BadRequestException,
  HttpStatus,
  NotFoundException as AppNotFoundException,
  ServerSideException,
  ServiceUnavailableException,
  TooManyRequestsException,
} from '../../exceptions';
import { HttpExceptionLog } from '../../express';

@Catch()
@Injectable()
export class ExceptionsFilter implements ExceptionFilter {
  private readonly exceptionLog = new HttpExceptionLog();

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const appException = this.toAppException(exception);

    this.exceptionLog.log(ctx.getRequest<Request>(), appException, {
      statusCode: appException.status,
      responseBody: appException.toBody(),
      sanitizedMessage: appException.message,
    });
    httpAdapter.reply(ctx.getResponse(), appException.toBody(), appException.status);
  }

  private toAppException(exception: unknown): AppException {
    if (exception instanceof AppException) {
      return exception;
    }

    if (exception instanceof HttpException) {
      return this.fromNest(exception);
    }

    return new ServerSideException({ internal: exception });
  }

  private fromNest(exception: HttpException): AppException {
    const response = exception.getResponse();
    const message = extractNestMessage(response);

    if (exception instanceof NestBadRequestException) {
      return new BadRequestException({
        code: 'bad_request',
        message: message || 'Bad Request',
        internal: exception,
      });
    }

    if (exception instanceof NestNotFoundException) {
      return new AppNotFoundException({
        code: 'not_found',
        message: message || 'Not found',
        internal: exception,
      });
    }

    if (isThrottlerException(exception)) {
      return new TooManyRequestsException({
        message: message || 'Too many requests',
        internal: exception,
      });
    }

    if (exception instanceof NestServiceUnavailableException) {
      return new ServiceUnavailableException({
        message: message || undefined,
        internal: exception,
      });
    }

    return new AppException({
      status: exception.getStatus(),
      code: 'request_failed',
      message: message || 'Request failed',
      internal: exception,
    });
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
