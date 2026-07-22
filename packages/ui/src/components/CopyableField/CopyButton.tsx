'use client';

import IconButton from '@mui/material/IconButton';
import { type SxProps, useTheme } from '@mui/material/styles';
import { type MouseEvent, type SVGProps, useEffect, useState } from 'react';

import { iconStyle } from '../../utils/iconStyle';

const COPIED_RESET_MS = 1500;

function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        width="14"
        height="14"
        x="8"
        y="8"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
        style={iconStyle({
          size: iconSize,
          color: copied ? theme.colors.icon.accent : theme.colors.icon.secondary,
        })}
      />
    </IconButton>
  );
}
