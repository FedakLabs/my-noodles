import { HttpAccessLog } from '@my-noodles/api-lib/logging';
import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { type Observable, tap } from 'rxjs';
import type { Logger } from 'winston';

import { config } from '@/config';

@Injectable()
export class HttpAccessLogInterceptor implements NestInterceptor {
  private readonly accessLog: HttpAccessLog;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    this.accessLog = new HttpAccessLog(logger, {
      appName: config.appName,
      appVersion: config.appVersion,
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const started = this.accessLog.markRequestStart(request);

    return next.handle().pipe(
      tap(() => {
        this.accessLog.logSuccess(request, response.statusCode, started);
      }),
    );
  }
}
