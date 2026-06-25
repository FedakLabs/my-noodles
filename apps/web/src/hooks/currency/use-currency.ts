'use client';

import { useCallback } from 'react';

import { useAppLocale } from '@/hooks/locale';
import {
  DEFAULT_CURRENCY,
  formatCurrency as formatCurrencyUtil,
  majorToMinor as majorToMinorUtil,
  minorToMajor as minorToMajorUtil,
} from '@/utils/format-currency';

export function useCurrency() {
  const locale = useAppLocale();

  const formatCurrency = useCallback(
    (amountMinor: number, currency: string | null | undefined = DEFAULT_CURRENCY) =>
      formatCurrencyUtil(amountMinor, currency, locale),
    [locale],
  );

  const minorToMajor = useCallback(
    (amountMinor: number, currency?: string | null) => minorToMajorUtil(amountMinor, currency),
    [],
  );

  const majorToMinor = useCallback(
    (amountMajor: number, currency?: string | null) => majorToMinorUtil(amountMajor, currency),
    [],
  );

  return { formatCurrency, minorToMajor, majorToMinor, defaultCurrency: DEFAULT_CURRENCY };
}
