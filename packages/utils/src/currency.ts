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

export type MinorUnitsSeparators = {
  groupingSeparator: string;
  decimalSeparator: string;
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(value);
}

export function resolveCurrency(currency: string | null | undefined): CurrencyCode {
  return currency != null && isCurrencyCode(currency) ? currency : DEFAULT_CURRENCY;
}

export function minorFactor(currency: CurrencyCode): number {
  return 10 ** CURRENCIES[currency].minorExponent;
}

/** Integer minor units → major amount (e.g. 9900 kop → 99 UAH). */
export function minorToMajor(amountMinor: number, currency?: string | null): number {
  return amountMinor / minorFactor(resolveCurrency(currency));
}

/** Major amount → integer minor units (rounded). */
export function majorToMinor(amountMajor: number, currency?: string | null): number {
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
export function formatMinorUnits(
  amountMinor: number,
  minorExponent: number,
  { groupingSeparator, decimalSeparator }: MinorUnitsSeparators,
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
