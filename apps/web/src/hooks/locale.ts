'use client';

import { useLocale } from 'next-intl';

import type { AppLocale } from '@/i18n/routing';

/** Current app locale from next-intl — same codes as `Locale` for storefront requests. */
export function useAppLocale(): AppLocale {
  return useLocale();
}
