import { type ArgumentsHost, Catch, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import type { Logger } from 'winston';

import { config } from '../../config';
import { buildHttpAccessLog, emitManifestLog } from './manifest-log';

@Injectable()
@Catch()
export class ManifestHttpExceptionFilter extends BaseExceptionFilter {
  constructor(
    httpAdapterHost: HttpAdapterHost,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super(httpAdapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() === 'http') {
      this.logHttpException(exception, host);
    }

    super.catch(exception, host);
  }

  private logHttpException(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<Request>();
    const startTimeMs = request.startTimeMs ?? performance.now();

    const record = buildHttpAccessLog({
      request,
      statusCode: this.resolveStatusCode(exception),
      execTimeMs: performance.now() - startTimeMs,
      logging: config.logging,
      error: exception,
    });

    emitManifestLog(this.logger, record);
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
