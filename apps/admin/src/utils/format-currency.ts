import { CURRENCIES, formatMinorUnits, resolveCurrency, type CurrencyCode } from '@my-noodles/utils';

/** Admin is uk-only for now — display rules match storefront `uk` currency formatting. */
const UK_DISPLAY: Record<
  CurrencyCode,
  {
    groupingSeparator: string;
    decimalSeparator: string;
    symbol: string;
    symbolPosition: 'before' | 'after';
    spaceBetween: boolean;
  }
> = {
  UAH: {
    groupingSeparator: '\u00a0',
    decimalSeparator: ',',
    symbol: '₴',
    symbolPosition: 'after',
    spaceBetween: true,
  },
  USD: {
    groupingSeparator: '\u00a0',
    decimalSeparator: ',',
    symbol: '$',
    symbolPosition: 'before',
    spaceBetween: false,
  },
};

export function formatCurrency(amountMinor: number, currency: string | null | undefined): string {
  const code = resolveCurrency(currency);
  const display = UK_DISPLAY[code];
  const { minorExponent } = CURRENCIES[code];
  const amount = formatMinorUnits(amountMinor, minorExponent, display);
  const gap = display.spaceBetween ? '\u00a0' : '';
  return display.symbolPosition === 'before'
    ? `${display.symbol}${gap}${amount}`
    : `${amount}${gap}${display.symbol}`;
}
