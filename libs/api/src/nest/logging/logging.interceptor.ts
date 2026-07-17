import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';
import type { Logger } from 'winston';

import { APP_LOGGER, HttpAccessLog } from '../../logging';
import { HTTP_LOG_METADATA, type HttpLogMetadata } from './http-log-metadata';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly accessLog: HttpAccessLog;

  constructor(@Inject(APP_LOGGER) logger: Logger, @Inject(HTTP_LOG_METADATA) metadata: HttpLogMetadata) {
    this.accessLog = new HttpAccessLog(logger, metadata);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const started = this.accessLog.markRequestStart(request);

    return next.handle().pipe(
      tap((responseBody) => {
        this.accessLog.logSuccess(request, response.statusCode, started, responseBody);
      }),
    );
  }
}
