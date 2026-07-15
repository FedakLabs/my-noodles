import type { NextFunction, Request, Response } from 'express';

import { LocaleContext } from './locale.context';
import { parseRequestLocale } from './locale.utils';

/** Binds request locale (`x-app-locale` → `Accept-Language` → default) for the rest of the pipeline. */
export function localeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const locale = parseRequestLocale(req);
  LocaleContext.run(locale, () => next());
}
