'use client';

import type { AppLocale } from '@/i18n/routing';

import { useLocaleStore } from './locale-store';

type LocaleSyncProps = {
  locale: AppLocale;
};

export function LocaleSync({ locale }: LocaleSyncProps) {
  const { locale: currentLocale, setLocale } = useLocaleStore.getState();
  if (currentLocale !== locale) {
    setLocale(locale);
  }

  return null;
}
