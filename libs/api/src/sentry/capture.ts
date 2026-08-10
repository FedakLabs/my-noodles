import { captureException as sentryCaptureException } from '@sentry/node';

import type { AppException } from '../exceptions';

/** Report server-side failures to Sentry; skip expected client errors (4xx). */
export function captureAppException(appException: AppException): void {
  if (appException.status < 500) {
    return;
  }

  const error =
    appException.internal instanceof Error
      ? appException.internal
      : appException.internal != null
        ? new Error(appException.message, { cause: appException.internal })
        : appException;

  sentryCaptureException(error, {
    tags: {
      code: appException.code,
      status: String(appException.status),
    },
  });
}
