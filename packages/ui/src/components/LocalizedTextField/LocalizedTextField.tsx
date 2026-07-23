'use client';

import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';

export type LocalizedTextFieldLocaleOption = {
  value: string;
  label: string;
};

export type LocalizedTextFieldValue = Record<string, string | undefined>;

const DEFAULT_LOCALES: readonly LocalizedTextFieldLocaleOption[] = [
  { value: 'uk', label: 'uk' },
  { value: 'en', label: 'en' },
];

export type LocalizedTextFieldProps = {
  label: string;
  value: LocalizedTextFieldValue;
  onChange: (value: LocalizedTextFieldValue) => void;
  locales?: readonly LocalizedTextFieldLocaleOption[];
  /** Locale marked required when `required` is true. Defaults to the first locale. */
  requiredLocale?: string;
  required?: boolean;
  multiline?: boolean;
  minRows?: number;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
};

export function LocalizedTextField({
  label,
  value,
  onChange,
  locales = DEFAULT_LOCALES,
  requiredLocale,
  required = false,
  multiline = false,
  minRows,
  disabled = false,
  size = 'medium',
  fullWidth = true,
}: LocalizedTextFieldProps) {
  const firstLocale = locales[0]?.value ?? 'uk';
  const requiredKey = requiredLocale ?? firstLocale;
  const [activeLocale, setActiveLocale] = useState(firstLocale);

  useEffect(() => {
    if (!locales.some((locale) => locale.value === activeLocale)) {
      setActiveLocale(firstLocale);
    }
  }, [activeLocale, firstLocale, locales]);

  return (
    <TextField
      label={label}
      value={value[activeLocale] ?? ''}
      onChange={(event) => onChange({ ...value, [activeLocale]: event.target.value })}
      required={required && activeLocale === requiredKey}
      multiline={multiline}
      minRows={minRows}
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment
              position="start"
              disableTypography
              sx={{
                alignSelf: 'stretch',
                height: 'auto',
                maxHeight: 'none',
                ml: -1.75,
                mr: 1,
                my: multiline ? -1 : 0,
                pointerEvents: 'auto',
              }}
            >
              <Select
                variant="standard"
                disableUnderline
                value={activeLocale}
                onChange={(event) => setActiveLocale(event.target.value)}
                onMouseDown={(event) => {
                  // Keep the parent TextField from stealing the click.
                  event.stopPropagation();
                }}
                disabled={disabled}
                aria-label={`${label} locale`}
                sx={{
                  alignSelf: 'stretch',
                  height: '100%',
                  bgcolor: 'transparent',
                  borderRight: 1,
                  borderColor: 'divider',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    height: '100% !important',
                    boxSizing: 'border-box',
                    py: 0,
                    pl: 1.25,
                    pr: '24px !important',
                    cursor: 'pointer',
                    typography: 'body2',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  },
                  '& .MuiSelect-icon': {
                    right: 2,
                    pointerEvents: 'none',
                  },
                }}
              >
                {locales.map((locale) => (
                  <MenuItem key={locale.value} value={locale.value}>
                    {locale.label.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
