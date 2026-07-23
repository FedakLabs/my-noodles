'use client';

import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { DEFAULT_LOCALE, LOCALE_OPTIONS } from '@my-noodles/locale';
import { useEffect, useState } from 'react';

import { useLocalizedFieldsContext } from './localized-fields-context';

export type LocalizedTextFieldLocaleOption = {
  value: string;
  label: string;
};

export type LocalizedTextFieldValue = Record<string, string | undefined>;

export type LocalizedTextFieldProps = {
  label: string;
  value: LocalizedTextFieldValue;
  onChange: (value: LocalizedTextFieldValue) => void;
  locales?: readonly LocalizedTextFieldLocaleOption[];
  /** When true, every locale in `locales` is required. */
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
  locales: localesProp,
  required = false,
  multiline = false,
  minRows,
  disabled: disabledProp = false,
  size = 'medium',
  fullWidth = true,
}: LocalizedTextFieldProps) {
  const shared = useLocalizedFieldsContext();
  const locales = shared?.locales ?? localesProp ?? LOCALE_OPTIONS;
  const firstLocale = locales[0]?.value ?? DEFAULT_LOCALE;
  const [localActiveLocale, setLocalActiveLocale] = useState(firstLocale);

  const activeLocale = shared?.activeLocale ?? localActiveLocale;
  const disabled = disabledProp || (shared?.disabled ?? false);
  const sharedMode = shared != null;

  useEffect(() => {
    if (sharedMode) {
      return;
    }
    if (!locales.some((locale) => locale.value === localActiveLocale)) {
      setLocalActiveLocale(firstLocale);
    }
  }, [firstLocale, localActiveLocale, locales, sharedMode]);

  const activeLocaleLabel = (
    locales.find((locale) => locale.value === activeLocale)?.label ?? activeLocale
  ).toUpperCase();

  return (
    <TextField
      label={label}
      value={value[activeLocale] ?? ''}
      onChange={(event) => onChange({ ...value, [activeLocale]: event.target.value })}
      required={required}
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
                pointerEvents: sharedMode ? 'none' : 'auto',
              }}
            >
              {sharedMode ? (
                <Box
                  aria-hidden
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    height: '100%',
                    boxSizing: 'border-box',
                    pl: 1.25,
                    pr: 1.25,
                    borderRight: 1,
                    borderColor: 'divider',
                    typography: 'body2',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'text.secondary',
                  }}
                >
                  {activeLocaleLabel}
                </Box>
              ) : (
                <Select
                  variant="standard"
                  disableUnderline
                  value={activeLocale}
                  onChange={(event) => setLocalActiveLocale(event.target.value)}
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
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
