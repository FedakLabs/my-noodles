'use client';

import IconButton from '@mui/material/IconButton';
import { type SxProps, useTheme } from '@mui/material/styles';
import { type MouseEvent, useEffect, useState } from 'react';

import CheckIcon from '../../icons/check.svg';
import CopyIcon from '../../icons/copy.svg';

const COPIED_RESET_MS = 1500;

export type CopyButtonProps = {
  value: string;
  /** Accessible label while idle. */
  label?: string;
  /** Accessible label after a successful copy. */
  copiedLabel?: string;
  sx?: SxProps;
  onCopied?: () => void;
};

export function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied', sx, onCopied }: CopyButtonProps) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.();
    } catch {
      setCopied(false);
    }
  }

  const Icon = copied ? CheckIcon : CopyIcon;

  const iconSize = 16;

  return (
    <IconButton
      aria-label={copied ? copiedLabel : label}
      color="inherit"
      size="small"
      onClick={(event) => {
        void handleCopy(event);
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      sx={[
        {
          p: 0,
          width: iconSize,
          height: iconSize,
          minWidth: iconSize,
          minHeight: iconSize,
          borderRadius: 0.5,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Icon
        aria-hidden
        size={iconSize}
        color={copied ? theme.colors.icon.accent : theme.colors.icon.secondary}
      />
    </IconButton>
  );
}
