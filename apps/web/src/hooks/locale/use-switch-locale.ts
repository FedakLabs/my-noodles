'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { LOCALE_OPTIONS } from '@/i18n/locales';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

import { useAppLocale, useLocaleStore } from './locale-store';
import { switchAppLocale } from './switch-locale';

export function useSwitchLocale() {
  const locale = useAppLocale();
  const setLocale = useLocaleStore((state) => state.setLocale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchLocale = useCallback(
    (next: AppLocale) => {
      switchAppLocale(next, locale, pathname, searchParams, router, setLocale);
    },
    [locale, pathname, router, searchParams, setLocale],
  );

  return { locale, switchLocale, options: LOCALE_OPTIONS };
}
