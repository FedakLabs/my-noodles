const CURRENCY_MINOR_EXPONENT: Record<string, number> = {
  UAH: 2,
};

export const DEFAULT_CURRENCY = 'UAH';

function currencyMinorFactor(currency: string): number {
  return 10 ** (CURRENCY_MINOR_EXPONENT[currency] ?? 2);
}

export function minorToMajor(amountMinor: number, currency = 'UAH'): number {
  return amountMinor / currencyMinorFactor(currency);
}

export function majorToMinor(amountMajor: number, currency = 'UAH'): number {
  return Math.round(amountMajor * currencyMinorFactor(currency));
}

export function formatCurrency(amountMinor: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(minorToMajor(amountMinor, currency));
}
