import type { AppLocale } from '@/i18n/routing';

import { resolveAppLocaleForQueryKey } from './resolve-query-key-locale';

export function withAppLocaleKey<Args extends readonly unknown[], Key extends readonly unknown[]>(
  build: (...args: Args) => Key,
): (...args: Args) => readonly [AppLocale, ...Key] {
  return (...args: Args) =>
    [resolveAppLocaleForQueryKey(), ...build(...args)] as readonly [AppLocale, ...Key];
}
