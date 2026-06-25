import 'server-only';

import { AsyncLocalStorage } from 'node:async_hooks';

import type { AppLocale } from '@/i18n/routing';

const storage = new AsyncLocalStorage<AppLocale>();

export function runWithAppLocale<T>(locale: AppLocale, fn: () => T): T {
  return storage.run(locale, fn);
}

export function getRequestAppLocale(): AppLocale | undefined {
  return storage.getStore();
}
