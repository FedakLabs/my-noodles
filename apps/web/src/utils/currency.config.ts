import { resolveLocale } from '@my-noodles/locale';
import type { CurrencyCode } from '@my-noodles/utils';

import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

type CurrencyDisplay = {
  symbol: string;
  symbolPosition: 'before' | 'after';
  spaceBetween: boolean;
};

export type LocaleCurrencyDisplay = {
  groupingSeparator: string;
  decimalSeparator: string;
  currency: Record<CurrencyCode, CurrencyDisplay>;
};

/** Display rules keyed by app locale (`routing.locales`) — not ICU / BCP-47 tags. */
export const LOCALE_CURRENCY_DISPLAY: Record<AppLocale, LocaleCurrencyDisplay> = {
  uk: {
    groupingSeparator: '\u00a0',
    decimalSeparator: ',',
    currency: {
      UAH: { symbol: '₴', symbolPosition: 'after', spaceBetween: true },
      USD: { symbol: '$', symbolPosition: 'before', spaceBetween: false },
    },
  },
  en: {
    groupingSeparator: ',',
    decimalSeparator: '.',
    currency: {
      UAH: { symbol: '₴', symbolPosition: 'before', spaceBetween: false },
      USD: { symbol: '$', symbolPosition: 'before', spaceBetween: false },
    },
  },
};

export function resolveAppLocale(locale: string): AppLocale {
  return resolveLocale(locale, routing.defaultLocale);
}
