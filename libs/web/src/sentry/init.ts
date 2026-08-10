import * as Sentry from '@sentry/react';

export type BrowserSentryOptions = Readonly<{
  /** When missing/empty, Sentry is not initialized. */
  dsn?: string;
  environment: string;
  release?: string;
}>;

/** Starts the browser Sentry SDK when a DSN is present. Safe no-op otherwise. */
export function prepareSentry(options: BrowserSentryOptions): void {
  const dsn = options.dsn?.trim();
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: options.environment,
    release: options.release,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}
