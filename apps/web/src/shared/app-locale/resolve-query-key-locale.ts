import { useLocaleStore } from '@/hooks/locale/locale-store';
import type { AppLocale } from '@/i18n/routing';

let serverLocaleProvider: (() => AppLocale | undefined) | undefined;

export function registerQueryKeyLocaleProvider(provider: () => AppLocale | undefined): void {
  serverLocaleProvider = provider;
}

/** Locale segment for TanStack Query keys — ALS during RSC prefetch, Zustand elsewhere. */
export function resolveAppLocaleForQueryKey(): AppLocale {
  const fromServer = serverLocaleProvider?.();
  if (fromServer) {
    return fromServer;
  }

  // Client-component SSR runs outside ALS; LocaleSync updates Zustand before children render.
  return useLocaleStore.getState().locale;
}
