import 'server-only';

import { createContext } from '@my-noodles/web-lib/context';

import type { AppLocale } from '@/i18n/routing';

const appLocaleContext = createContext<AppLocale>('APP_LOCALE');

export function runWithAppLocale<T>(locale: AppLocale, fn: () => T): T {
  return appLocaleContext.run(locale, fn);
}

export function getRequestAppLocale(): AppLocale | undefined {
  return appLocaleContext.get({ silent: true }) ?? undefined;
}
