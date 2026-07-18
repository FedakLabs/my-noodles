import type { Request } from 'express';

import { getTimingElapsedMs } from '../api-client/request-timing';
import { buildIngoingHttpManifestLog, emitHttpManifestLog, logger } from '../logger';
import { buildIngoingManifestInput } from './logger';

export type HttpExceptionLogOptions = Readonly<{
  statusCode?: number;
  responseBody?: unknown;
  sanitizedMessage?: string;
}>;

type HttpStatusException = {
  getStatus: () => number;
};

export class HttpExceptionLog {
  resolveStatusCode(exception: unknown): number {
    if (this.isHttpStatusException(exception)) {
      return exception.getStatus();
    }

    if (this.hasNumericStatus(exception)) {
      return exception.status;
    }

    return 500;
  }

  log(request: Request, rawError: unknown, options: HttpExceptionLogOptions = {}): void {
    const record = buildIngoingHttpManifestLog(
      buildIngoingManifestInput(request, {
        responseStatus: options.statusCode ?? this.resolveStatusCode(rawError),
        execTimeMs: getTimingElapsedMs(request),
        error: rawError,
        responseBody: options.responseBody,
        sanitizedMessage: options.sanitizedMessage,
      }),
    );

    emitHttpManifestLog(logger, record);
  }

  private isHttpStatusException(exception: unknown): exception is HttpStatusException {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'getStatus' in exception &&
      typeof (exception as HttpStatusException).getStatus === 'function'
    );
  }

  private hasNumericStatus(exception: unknown): exception is { status: number } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'status' in exception &&
      typeof (exception as { status: unknown }).status === 'number'
    );
  }
}
