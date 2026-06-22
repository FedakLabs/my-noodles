'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

type SmoothBusyVeilProps = {
  visible: boolean;
  label: string;
  transitionMs: number;
  transitionEasing: string;
  position?: 'absolute' | 'fixed';
  /** Top offset (e.g. header height) when positioned over the full viewport. */
  top?: number | string;
  zIndex?: number;
  borderRadius?: number;
};

export function SmoothBusyVeil({
  visible,
  label,
  transitionMs,
  transitionEasing,
  position = 'absolute',
  top = 0,
  zIndex = 1,
  borderRadius = 1,
}: SmoothBusyVeilProps) {
  const transition = `opacity ${transitionMs}ms ${transitionEasing}, backdrop-filter ${transitionMs}ms ${transitionEasing}`;

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy={visible}
      aria-label={visible ? label : undefined}
      sx={(theme) => ({
        position,
        top,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        transition,
        bgcolor: alpha(theme.palette.background.default, 0.42),
        backdropFilter: visible ? 'blur(3px)' : 'blur(0px)',
        borderRadius,
      })}
    />
  );
}
