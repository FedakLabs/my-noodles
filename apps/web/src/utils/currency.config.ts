import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

/** ISO 4217 codes we accept from the API today — extend here for multi-currency. */
export const CURRENCY_CODES = ['UAH'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = 'UAH';

type CurrencyDefinition = {
  /** Divisor for minor units: major = amountMinor / 10^minorExponent (UAH kopiyky → 2). */
  minorExponent: number;
};

export const CURRENCIES: Record<CurrencyCode, CurrencyDefinition> = {
  UAH: { minorExponent: 2 },
};

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
    },
  },
  en: {
    groupingSeparator: ',',
    decimalSeparator: '.',
    currency: {
      UAH: { symbol: '₴', symbolPosition: 'before', spaceBetween: false },
    },
  },
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value);
}

export function resolveAppLocale(locale: string): AppLocale {
  const base = locale.split('-')[0]?.toLowerCase();

  if (base && (routing.locales as readonly string[]).includes(base)) {
    return base as AppLocale;
  }

  return routing.defaultLocale;
}

export function minorFactor(currency: CurrencyCode): number {
  return 10 ** CURRENCIES[currency].minorExponent;
}
