import { CURRENCIES, formatMinorUnits, resolveCurrency } from '@my-noodles/utils';

/** Admin is uk-only for now — display rules match storefront `uk` currency formatting. */
const UK_DISPLAY = {
  groupingSeparator: '\u00a0',
  decimalSeparator: ',',
  symbol: '₴',
  symbolPosition: 'after' as const,
  spaceBetween: true,
};

export function formatCurrency(amountMinor: number, currency: string | null | undefined): string {
  const code = resolveCurrency(currency);
  const { minorExponent } = CURRENCIES[code];
  const amount = formatMinorUnits(amountMinor, minorExponent, UK_DISPLAY);
  const gap = UK_DISPLAY.spaceBetween ? '\u00a0' : '';
  return `${amount}${gap}${UK_DISPLAY.symbol}`;
}
