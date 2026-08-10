import * as Sentry from '@sentry/node';

export type SentryOptions =
  | Readonly<{ enabled: false }>
  | Readonly<{ enabled: true; dsn: string; environment: string; release?: string }>;

/** Starts the Node Sentry SDK when enabled. Safe to call at process preload. */
export function prepareSentry(options: SentryOptions): void {
  if (!options.enabled) {
    return;
  }

  Sentry.init({
    dsn: options.dsn,
    environment: options.environment,
    release: options.release,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}
