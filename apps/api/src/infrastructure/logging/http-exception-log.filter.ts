import { HttpExceptionLog } from '@my-noodles/api-lib/logging';
import { type ArgumentsHost, Catch, Inject, Injectable } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

import { config } from '@/config';

@Injectable()
@Catch()
export class HttpExceptionLogFilter extends BaseExceptionFilter {
  private readonly exceptionLog: HttpExceptionLog;

  constructor(httpAdapterHost: HttpAdapterHost, @Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
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

    super.catch(exception, host);
  }
}
