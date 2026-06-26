'use client';

import Box from '@mui/material/Box';

import { BUSY_SCRIM_Z_INDEX } from './tokens';

export type BusyScrimProps = {
  /** When true, the invisible layer captures pointer events. */
  blocking: boolean;
  label: string;
  position?: 'absolute' | 'fixed';
  /** Top offset (e.g. header height) when positioned over the full viewport. */
  top?: number | string;
  zIndex?: number;
  borderRadius?: number;
};

/** Invisible click shield — internal; use `scrim` on BusyArea instead. */
export function BusyScrim({
  blocking,
  label,
  position = 'absolute',
  top = 0,
  zIndex = BUSY_SCRIM_Z_INDEX,
  borderRadius = 1,
}: BusyScrimProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy={blocking}
      aria-label={blocking ? label : undefined}
      sx={{
        position,
        top,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        pointerEvents: blocking ? 'auto' : 'none',
        bgcolor: 'transparent',
        borderRadius,
      }}
    />
  );
}
