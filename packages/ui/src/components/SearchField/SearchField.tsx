'use client';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { KeyboardEvent } from 'react';

import { SelectField } from '../SelectField';

export type SearchFieldOption = {
  value: string;
  label: string;
};

export type SearchFieldProps = {
  fields: SearchFieldOption[];
  field: string;
  onFieldChange: (field: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  /** Label for the field select. */
  fieldLabel?: string;
  /** Label for the text input. */
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  /** Fixed width of the field select. Defaults to 140. */
  fieldWidth?: number | string;
};

export function SearchField({
  fields,
  field,
  onFieldChange,
  value,
  onValueChange,
  onSubmit,
  fieldLabel,
  label,
  placeholder,
  size = 'small',
  fieldWidth = 140,
}: SearchFieldProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onSubmit?.();
    }
  }

  return (
    <Stack
      direction="row"
      spacing={0}
      useFlexGap
      sx={{
        alignItems: 'flex-start',
        flex: '1 1 280px',
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
        },
        '& > :first-of-type .MuiOutlinedInput-root': {
          borderTopLeftRadius: (theme) => theme.shape.borderRadius,
          borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
        },
        '& > :last-of-type .MuiOutlinedInput-root': {
          borderTopRightRadius: (theme) => theme.shape.borderRadius,
          borderBottomRightRadius: (theme) => theme.shape.borderRadius,
          marginLeft: '-1px',
        },
      }}
    >
      <SelectField
        label={fieldLabel}
        size={size}
        width={fieldWidth}
        value={field}
        onChange={(event) => onFieldChange(String(event.target.value))}
      >
        {fields.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </SelectField>
      <TextField
        label={label}
        placeholder={placeholder}
        size={size}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ flex: '1 1 160px', minWidth: 120 }}
      />
    </Stack>
  );
}
