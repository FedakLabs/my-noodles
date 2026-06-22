import {
  CURRENCIES,
  type CurrencyCode,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  LOCALE_CURRENCY_DISPLAY,
  type LocaleCurrencyDisplay,
  minorFactor,
  resolveAppLocale,
} from './currency.config';

export { type CurrencyCode, DEFAULT_CURRENCY } from './currency.config';

function resolveCurrency(currency: string): CurrencyCode {
  return isCurrencyCode(currency) ? currency : DEFAULT_CURRENCY;
}

/** Integer minor units → major amount (e.g. 9900 kop → 99 UAH). */
export function minorToMajor(amountMinor: number, currency: string = DEFAULT_CURRENCY): number {
  return amountMinor / minorFactor(resolveCurrency(currency));
}

/** Major amount → integer minor units (rounded). */
export function majorToMinor(amountMajor: number, currency: string = DEFAULT_CURRENCY): number {
  return Math.round(amountMajor * minorFactor(resolveCurrency(currency)));
}

function groupIntegerDigits(digits: string, separator: string): string {
  if (digits.length <= 3) {
    return digits;
  }

  const parts: string[] = [];

  for (let index = digits.length; index > 0; index -= 3) {
    parts.unshift(digits.slice(Math.max(0, index - 3), index));
  }

  return parts.join(separator);
}

/** Format integer minor units without Intl — stable across Node SSR and browser. */
function formatMinorUnits(
  amountMinor: number,
  minorExponent: number,
  { groupingSeparator, decimalSeparator }: LocaleCurrencyDisplay,
): string {
  const factor = 10 ** minorExponent;
  const sign = amountMinor < 0 ? '-' : '';
  const absolute = Math.abs(amountMinor);
  const whole = Math.trunc(absolute / factor);
  const fraction = absolute % factor;

  const wholeFormatted = groupIntegerDigits(String(whole), groupingSeparator);

  if (fraction === 0) {
    return `${sign}${wholeFormatted}`;
  }

  const fractionDigits = String(fraction).padStart(minorExponent, '0').replace(/0+$/, '');

  return `${sign}${wholeFormatted}${decimalSeparator}${fractionDigits}`;
}

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
export function formatCurrency(amountMinor: number, currency: string, locale: string): string {
  const code = resolveCurrency(currency);
  const appLocale = resolveAppLocale(locale);
  const localeDisplay = LOCALE_CURRENCY_DISPLAY[appLocale];
  const { minorExponent } = CURRENCIES[code];

  const amount = formatMinorUnits(amountMinor, minorExponent, localeDisplay);

  return applyCurrencySymbol(amount, localeDisplay.currency[code]);
}
