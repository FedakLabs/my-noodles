import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';

import { HttpAccessLog } from '../../express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly accessLog = new HttpAccessLog();

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
