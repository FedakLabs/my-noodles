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

import { config } from '../../config';
import { buildHttpAccessLog, emitManifestLog } from './manifest-log';

@Injectable()
export class HttpAccessLogInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = performance.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    request.startTimeMs = started;

    return next.handle().pipe(
      tap(() => {
        const record = buildHttpAccessLog({
          request,
          statusCode: response.statusCode,
          execTimeMs: performance.now() - started,
          logging: config.logging,
        });

        emitManifestLog(this.logger, record);
      }),
    );
  }
}
