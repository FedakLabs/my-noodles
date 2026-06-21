'use client';

import LinearProgress from '@mui/material/LinearProgress';

export type StableLinearProgressProps = {
  active: boolean;
  transitionMs?: number;
  transitionEasing?: string;
  height?: number;
  'aria-label'?: string;
};

/**
 * Reserves layout space so opacity transitions do not shift surrounding content.
 */
export function StableLinearProgress({
  active,
  transitionMs = 250,
  transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  height = 2,
  'aria-label': ariaLabel,
}: StableLinearProgressProps) {
  return (
    <LinearProgress
      aria-hidden={!active}
      aria-label={active ? ariaLabel : undefined}
      sx={{
        height,
        borderRadius: 1,
        opacity: active ? 1 : 0,
        visibility: active ? 'visible' : 'hidden',
        transition: `opacity ${transitionMs}ms ${transitionEasing}`,
      }}
    />
  );
}
