'use client';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/** Mobile vs desktop shell at theme `desktop` breakpoint (`DESKTOP_MIN_WIDTH` in `@my-noodles/theme`). */
export function useViewport() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('desktop'));

  return { isDesktop, isMobile: !isDesktop };
}
