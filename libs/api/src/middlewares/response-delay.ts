import type { NextFunction, Request, Response } from 'express';

export type ResponseDelayMiddlewareOptions = Readonly<{
  responseDelayMs: number;
  skipPaths?: readonly string[];
}>;

export function responseDelayMiddleware(options: ResponseDelayMiddlewareOptions) {
  const { responseDelayMs, skipPaths = [] } = options;

  return (req: Request, _res: Response, next: NextFunction) => {
    if (
      responseDelayMs > 0 &&
      !skipPaths.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`))
    ) {
      setTimeout(next, responseDelayMs);
      return;
    }
    next();
  };
}
