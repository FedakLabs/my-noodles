'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import { BUSY_SCRIM_ALPHA, busyScrimTransition } from './tokens';

export type BusyScrimProps = {
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

/** Flat scrim overlay — internal; use `scrim` on BusyArea instead. */
export function BusyScrim({
  visible,
  label,
  transitionMs,
  transitionEasing,
  position = 'absolute',
  top = 0,
  zIndex = 1,
  borderRadius = 1,
}: BusyScrimProps) {
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
        transition: busyScrimTransition(transitionMs, transitionEasing),
        bgcolor: alpha(theme.palette.background.default, BUSY_SCRIM_ALPHA),
        borderRadius,
      })}
    />
  );
}
