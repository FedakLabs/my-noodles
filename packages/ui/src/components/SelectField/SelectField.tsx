'use client';

import TextField, { type TextFieldProps } from '@mui/material/TextField';
import { useEffect, useState, type FocusEvent } from 'react';

function hasSelectValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'string') {
    return value.length > 0;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }

  return false;
}

export type SelectFieldProps = Omit<TextFieldProps, 'select'> & {
  /**
   * Fixed control width. Closed-value overflow is ellipsized so multi-select
   * labels cannot expand the field.
   */
  width?: number | string;
  /**
   * Treat an empty value as visually filled (e.g. `displayEmpty` + "All" in
   * `renderValue`). Shrinks the label without forcing shrink on truly empty selects.
   */
  visuallyFilledWhenEmpty?: boolean;
};

export function SelectField({
  width,
  visuallyFilledWhenEmpty = false,
  value,
  label,
  slotProps,
  sx,
  onFocus,
  onBlur,
  ...rest
}: SelectFieldProps) {
  const [focused, setFocused] = useState(false);
  const [labelEpoch, setLabelEpoch] = useState(0);

  const filled = hasSelectValue(value) || visuallyFilledWhenEmpty;
  const shrink = focused || filled;

  // After async fill / displayEmpty placeholder settles, remount the label so
  // the outlined notch width matches the shrunk label (middle ground vs always-shrink).
  useEffect(() => {
    if (!filled || label == null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLabelEpoch((epoch) => epoch + 1);
    }, 50);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filled, label, value]);

  const inputLabelFromSlots = typeof slotProps?.inputLabel === 'function' ? undefined : slotProps?.inputLabel;

  return (
    <TextField
      {...rest}
      select
      value={value}
      label={label == null ? label : <span key={`select-label-${labelEpoch}`}>{label}</span>}
      onFocus={(event: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        onBlur?.(event);
      }}
      slotProps={{
        ...slotProps,
        input: {
          ...(typeof slotProps?.input === 'function' ? undefined : slotProps?.input),
          notched: shrink,
        },
        inputLabel:
          typeof slotProps?.inputLabel === 'function'
            ? slotProps.inputLabel
            : {
                ...inputLabelFromSlots,
                shrink,
              },
      }}
      sx={[
        width != null
          ? {
              width,
              maxWidth: width,
              flexShrink: 0,
            }
          : null,
        {
          '& .MuiSelect-select': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
