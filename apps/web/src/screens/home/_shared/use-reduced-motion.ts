'use client';

import useMediaQuery from '@mui/material/useMediaQuery';

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', { defaultMatches: false });
}
