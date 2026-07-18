'use client';

import Box, { type BoxProps } from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import { BUSY_CONTENT_DIM_OPACITY, busyContentDimTransition } from './tokens';

export type BusyDimProps = BoxProps & {
  active: boolean;
  transitionMs: number;
  transitionEasing: string;
};

/** Fades wrapped children — internal; use `dim` on BusyArea instead. */
export function BusyDim({ active, transitionMs, transitionEasing, sx, ...boxProps }: BusyDimProps) {
  const dimSx: SxProps<Theme> = {
    opacity: active ? BUSY_CONTENT_DIM_OPACITY : 1,
    transition: busyContentDimTransition(transitionMs, transitionEasing),
  };

  // Flatten so callers can pass `sx={[a, b]}` — a nested `[dimSx, [a, b]]` drops the inner styles in MUI.
  const sxList = Array.isArray(sx) ? sx : sx != null ? [sx] : [];

  return <Box {...boxProps} sx={[dimSx, ...sxList] as SxProps<Theme>} />;
}
