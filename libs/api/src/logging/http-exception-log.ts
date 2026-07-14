import type { Request } from 'express';
import type { Logger } from 'winston';

import { type HttpAccessLogResource } from './http-access-log';
import { buildHttpAccessLog, emitManifestLog } from './manifest-log';
import { getRequestStartTimeMs } from './request-timing';

type HttpStatusException = {
  getStatus: () => number;
};

function isHttpStatusException(exception: unknown): exception is HttpStatusException {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'getStatus' in exception &&
    typeof (exception as HttpStatusException).getStatus === 'function'
  );
}

function hasNumericStatus(exception: unknown): exception is { status: number } {
  return (
    typeof exception === 'object' &&
    exception !== null &&
    'status' in exception &&
    typeof (exception as { status: unknown }).status === 'number'
  );
}

/** Framework-agnostic manifest access logging for HTTP errors. */
export class HttpExceptionLog {
  constructor(
    private readonly logger: Logger,
    private readonly resource: HttpAccessLogResource,
  ) {}

  resolveStatusCode(exception: unknown): number {
    if (isHttpStatusException(exception)) {
      return exception.getStatus();
    }

    if (hasNumericStatus(exception)) {
      return exception.status;
    }

    return 500;
  }

  log(request: Request, exception: unknown): void {
    const startTimeMs = getRequestStartTimeMs(request);
    const record = buildHttpAccessLog({
      request,
      statusCode: this.resolveStatusCode(exception),
      execTimeMs: performance.now() - startTimeMs,
      ...this.resource,
      error: exception,
    });

    emitManifestLog(this.logger, record);
  }
}
