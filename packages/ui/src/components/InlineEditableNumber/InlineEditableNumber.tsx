'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

import CheckIcon from '../../icons/check.svg';
import CloseIcon from '../../icons/close.svg';

export type InlineEditableNumberProps = {
  value: number;
  onSubmitRequest: (next: number) => void;
  disabled?: boolean;
  ariaLabel: string;
  confirmLabel: string;
  cancelLabel: string;
};

function parseNonNegativeInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  return Number(trimmed);
}

export function InlineEditableNumber({
  value,
  onSubmitRequest,
  disabled = false,
  ariaLabel,
  confirmLabel,
  cancelLabel,
}: InlineEditableNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(String(value));
    }
  }, [editing, value]);

  useEffect(() => {
    if (!editing) {
      return;
    }
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.focus();
    input.select();
  }, [editing]);

  function cancelEdit() {
    setDraft(String(value));
    setEditing(false);
  }

  function requestSubmit() {
    const parsed = parseNonNegativeInt(draft);
    if (parsed === null || parsed === value) {
      cancelEdit();
      return;
    }
    setEditing(false);
    onSubmitRequest(parsed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      requestSubmit();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancelEdit();
    }
  }

  /** Keep focus so blur does not cancel before the button click runs. */
  function suppressBlurOnMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  if (!editing) {
    return (
      <Box
        component="button"
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) {
            setEditing(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            if (!disabled) {
              setEditing(true);
            }
          }
        }}
        sx={{
          appearance: 'none',
          border: 0,
          background: 'transparent',
          font: 'inherit',
          color: 'inherit',
          typography: 'body2',
          cursor: disabled ? 'default' : 'pointer',
          display: 'inline-block',
          minWidth: 24,
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          boxSizing: 'border-box',
          opacity: disabled ? 0.5 : 1,
          '&:hover, &:focus-visible': disabled
            ? undefined
            : {
                bgcolor: 'action.hover',
                outline: 'none',
              },
          '&:focus-visible': disabled
            ? undefined
            : {
                boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}`,
              },
        }}
      >
        {value}
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0.25}
      useFlexGap
      sx={{ alignItems: 'center' }}
      onClick={(event) => event.stopPropagation()}
    >
      <TextField
        inputRef={inputRef}
        size="small"
        type="text"
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={cancelEdit}
        onKeyDown={handleKeyDown}
        slotProps={{
          htmlInput: {
            inputMode: 'numeric',
            pattern: '[0-9]*',
          },
        }}
        sx={{
          width: 72,
          '& .MuiInputBase-input': {
            py: 0.5,
            px: 1,
            typography: 'body2',
          },
        }}
      />
      <IconButton
        size="small"
        aria-label={confirmLabel}
        disabled={disabled}
        onMouseDown={suppressBlurOnMouseDown}
        onClick={(event) => {
          event.stopPropagation();
          requestSubmit();
        }}
      >
        <CheckIcon aria-hidden size={16} />
      </IconButton>
      <IconButton
        size="small"
        aria-label={cancelLabel}
        disabled={disabled}
        onMouseDown={suppressBlurOnMouseDown}
        onClick={(event) => {
          event.stopPropagation();
          cancelEdit();
        }}
      >
        <CloseIcon aria-hidden size={16} />
      </IconButton>
    </Stack>
  );
}
