import { CURRENCIES, type CurrencyCode, formatMinorUnits, resolveCurrency } from '@my-noodles/utils';

import { LOCALE_CURRENCY_DISPLAY, type LocaleCurrencyDisplay, resolveAppLocale } from './currency.config';

function applyCurrencySymbol(
  amount: string,
  { symbol, symbolPosition, spaceBetween }: LocaleCurrencyDisplay['currency'][CurrencyCode],
): string {
  const gap = spaceBetween ? '\u00a0' : '';

  if (symbolPosition === 'before') {
    return `${symbol}${gap}${amount}`;
  }

  return `${amount}${gap}${symbol}`;
}

/**
 * Display price from integer minor units (`priceMinor` = major × 100 for UAH).
 * Locale keys follow `AppLocale` (`uk` | `en`), not ICU tags.
 */
export function formatCurrency(
  amountMinor: number,
  currency: string | null | undefined,
  locale: string,
): string {
  const code = resolveCurrency(currency);
  const appLocale = resolveAppLocale(locale);
  const localeDisplay = LOCALE_CURRENCY_DISPLAY[appLocale];
  const { minorExponent } = CURRENCIES[code];

  const amount = formatMinorUnits(amountMinor, minorExponent, localeDisplay);

  return applyCurrencySymbol(amount, localeDisplay.currency[code]);
}
