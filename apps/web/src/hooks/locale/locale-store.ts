import { create } from 'zustand';

import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { localePath } from '@/shared/seo/urls';

type LocaleState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  switchLocale: (next: AppLocale) => void;
};

function localeSwitchHref(next: AppLocale, pathname: string, search: string): string {
  let path = pathname;

  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      path = '/';
      break;
    }

    const prefix = `/${locale}/`;
    if (pathname.startsWith(prefix)) {
      path = pathname.slice(prefix.length - 1);
      break;
    }
  }

  return `${localePath(next, path)}${search}`;
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: routing.defaultLocale,
  setLocale: (locale) => set({ locale }),
  switchLocale: (next) => {
    if (next === get().locale) {
      return;
    }

    const { pathname, search } = globalThis.location;
    const href = localeSwitchHref(next, pathname, search);
    // Defer navigation one frame so the global progress bar can paint first.
    globalThis.requestAnimationFrame(() => {
      globalThis.location.assign(href);
    });
  },
}));

export function useAppLocale(): AppLocale {
  return useLocaleStore((state) => state.locale);
}
