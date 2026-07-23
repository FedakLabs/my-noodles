'use client';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { DEFAULT_LOCALE, LOCALE_OPTIONS } from '@my-noodles/locale';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { SelectField } from '../SelectField';
import { LocalizedFieldsContext } from './localized-fields-context';
import type { LocalizedTextFieldLocaleOption } from './LocalizedTextField';

export type LocalizedFieldsProps = {
  children: ReactNode;
  /** Label for the shared locale selector shown above the fields. */
  localeLabel: string;
  locales?: readonly LocalizedTextFieldLocaleOption[];
  defaultLocale?: string;
  disabled?: boolean;
  spacing?: number;
};

/**
 * Shares one active locale across nested {@link LocalizedTextField}s.
 * Fields inside this group hide their per-field locale selects.
 */
export function LocalizedFields({
  children,
  localeLabel,
  locales = LOCALE_OPTIONS,
  defaultLocale,
  disabled = false,
  spacing = 2,
}: LocalizedFieldsProps) {
  const firstLocale = locales[0]?.value ?? DEFAULT_LOCALE;
  const initialLocale =
    defaultLocale && locales.some((locale) => locale.value === defaultLocale) ? defaultLocale : firstLocale;
  const [activeLocale, setActiveLocale] = useState(initialLocale);

  useEffect(() => {
    if (!locales.some((locale) => locale.value === activeLocale)) {
      setActiveLocale(firstLocale);
    }
  }, [activeLocale, firstLocale, locales]);

  const contextValue = useMemo(
    () => ({
      activeLocale,
      setActiveLocale,
      locales,
      disabled,
    }),
    [activeLocale, disabled, locales],
  );

  return (
    <LocalizedFieldsContext.Provider value={contextValue}>
      <Stack spacing={spacing}>
        <SelectField
          label={localeLabel}
          size="small"
          width={140}
          value={activeLocale}
          disabled={disabled}
          onChange={(event) => setActiveLocale(String(event.target.value))}
        >
          {locales.map((locale) => (
            <MenuItem key={locale.value} value={locale.value}>
              {locale.label.toUpperCase()}
            </MenuItem>
          ))}
        </SelectField>
        {children}
      </Stack>
    </LocalizedFieldsContext.Provider>
  );
}
