import type { NextFunction, Request, Response } from 'express';

export type ResponseDelayOptions = Readonly<{
  delayMs: number;
  /** Paths that skip the delay (exact match or prefix with trailing slash). */
  skipPaths?: readonly string[];
}>;

export type ResponseDelayMiddlewareOptions = Readonly<{
  responseDelayMs: number;
  skipPaths?: readonly string[];
}>;

/** Returns true when the path should receive the configured delay. */
export function shouldDelayResponse(
  path: string,
  options: Pick<ResponseDelayOptions, 'delayMs' | 'skipPaths'>,
): boolean {
  const { delayMs, skipPaths = [] } = options;

  if (delayMs <= 0) {
    return false;
  }

  return !skipPaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Promise that resolves after `delayMs` (no-op when delay is zero or less). */
export function delay(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/** Express middleware that artificially delays responses for local/dev latency simulation. */
export function responseDelayMiddleware(options: ResponseDelayMiddlewareOptions) {
  const delayOptions: ResponseDelayOptions = {
    delayMs: options.responseDelayMs,
    skipPaths: options.skipPaths,
  };

  return (req: Request, _res: Response, next: NextFunction) => {
    if (shouldDelayResponse(req.path, delayOptions)) {
      setTimeout(next, delayOptions.delayMs);
      return;
    }

    next();
  };
}
