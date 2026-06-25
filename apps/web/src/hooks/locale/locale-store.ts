import { create } from 'zustand';

import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

type LocaleState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: routing.defaultLocale,
  setLocale: (locale) => set({ locale }),
}));

export function useAppLocale(): AppLocale {
  return useLocaleStore((state) => state.locale);
}
