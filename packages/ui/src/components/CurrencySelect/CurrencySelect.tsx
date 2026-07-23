'use client';

import MenuItem from '@mui/material/MenuItem';

import { SelectField, type SelectFieldProps } from '../SelectField';

/** Matches `@my-noodles/utils` `CURRENCY_CODES` — pass that list from the app when available. */
const DEFAULT_CURRENCIES = ['UAH', 'USD'] as const;

export type CurrencySelectProps<T extends string = string> = Omit<
  SelectFieldProps,
  'select' | 'value' | 'onChange' | 'children'
> & {
  value?: T | null;
  onChange: (value: T) => void;
  currencies?: readonly T[];
};

export function CurrencySelect<T extends string = (typeof DEFAULT_CURRENCIES)[number]>({
  value,
  onChange,
  currencies = DEFAULT_CURRENCIES as unknown as readonly T[],
  label = 'Currency',
  size = 'medium',
  width = 120,
  ...rest
}: CurrencySelectProps<T>) {
  const selected =
    value != null && (currencies as readonly string[]).includes(value) ? value : (currencies[0] as T);

  return (
    <SelectField
      {...rest}
      size={size}
      label={label}
      width={width}
      value={selected}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {currencies.map((code) => (
        <MenuItem key={code} value={code}>
          {code}
        </MenuItem>
      ))}
    </SelectField>
  );
}
