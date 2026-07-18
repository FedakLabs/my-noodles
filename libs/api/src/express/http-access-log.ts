import type { Request } from 'express';

import { getTimingElapsedMs, markTimingStart } from '../api-client/request-timing';
import { buildIngoingHttpManifestLog, emitHttpManifestLog, logger } from '../logger';
import { buildIngoingManifestInput } from './logger';

export class HttpAccessLog {
  markRequestStart(request: Request): number {
    return markTimingStart(request);
  }

  logSuccess(request: Request, statusCode: number, startedMs?: number, responseBody?: unknown): void {
    const record = buildIngoingHttpManifestLog(
      buildIngoingManifestInput(request, {
        responseStatus: statusCode,
        execTimeMs: getTimingElapsedMs(request, startedMs),
        responseBody,
      }),
    );

    emitHttpManifestLog(logger, record);
  }
}
