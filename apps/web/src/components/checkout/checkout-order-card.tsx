'use client';

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { cardShadow } from '@my-noodles/theme';
import type { ReactNode } from 'react';

type CheckoutOrderCardProps = {
  children: ReactNode;
  'aria-label'?: string;
  sx?: BoxProps['sx'];
};

export function CheckoutOrderCard({ children, 'aria-label': ariaLabel, sx }: CheckoutOrderCardProps) {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-label={ariaLabel}
      sx={{
        width: '100%',
        borderRadius: `${theme.borderRadius.discovery}px`,
        border: 1,
        borderColor: alpha(theme.palette.divider, 0.9),
        bgcolor: alpha(theme.palette.background.paper, 0.88),
        backdropFilter: 'blur(12px)',
        boxShadow: cardShadow,
        p: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
