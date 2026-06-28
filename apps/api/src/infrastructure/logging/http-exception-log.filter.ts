import { APP_LOGGER, HttpExceptionLog } from '@my-noodles/api-lib/logging';
import { type ArgumentsHost, Catch, HttpException, Inject, Injectable } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import type { Logger } from 'winston';

import { config } from '@/config';
import { ServiceUnavailableException } from '@/infrastructure/exceptions';

@Injectable()
@Catch()
export class HttpExceptionLogFilter extends BaseExceptionFilter {
  private readonly exceptionLog: HttpExceptionLog;

  constructor(httpAdapterHost: HttpAdapterHost, @Inject(APP_LOGGER) logger: Logger) {
    super(httpAdapterHost.httpAdapter);
    this.exceptionLog = new HttpExceptionLog(logger, {
      appName: config.appName,
      appVersion: config.appVersion,
    });
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() === 'http') {
      const request = host.switchToHttp().getRequest<Request>();
      this.exceptionLog.log(request, exception);
    }

    const normalizedException =
      exception instanceof HttpException ? exception : new ServiceUnavailableException();

    super.catch(normalizedException, host);
  }
}
