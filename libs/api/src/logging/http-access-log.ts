import type { Request } from 'express';
import type { Logger } from 'winston';

import { buildHttpAccessLog, emitManifestLog } from './manifest-log';
import { getRequestStartTimeMs, markRequestStart } from './request-timing';

export type HttpAccessLogResource = Readonly<{
  appName: string;
  appVersion: string;
}>;

/** Framework-agnostic manifest access logging for successful HTTP responses. */
export class HttpAccessLog {
  constructor(
    private readonly logger: Logger,
    private readonly resource: HttpAccessLogResource,
  ) {}

  markRequestStart(request: Request): number {
    return markRequestStart(request);
  }

  logSuccess(request: Request, statusCode: number, startedMs?: number): void {
    const started = startedMs ?? getRequestStartTimeMs(request);
    const record = buildHttpAccessLog({
      request,
      statusCode,
      execTimeMs: performance.now() - started,
      ...this.resource,
    });

    emitManifestLog(this.logger, record);
  }
}
