'use client';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export function useViewport() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('desktop'));

  return { isDesktop, isMobile: !isDesktop };
}
