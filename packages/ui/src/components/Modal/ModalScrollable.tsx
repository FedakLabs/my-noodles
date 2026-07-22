'use client';

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';

export type ModalScrollableProps = Omit<BoxProps, 'children'> & {
  children: ReactNode;
  enabled?: boolean;
};

export const ModalScrollable = forwardRef<HTMLDivElement, ModalScrollableProps>(function ModalScrollable(
  { children, enabled = true, sx, ...boxProps },
  ref,
) {
  return (
    <Box
      ref={ref}
      {...boxProps}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowX: 'hidden',
        overflowY: enabled ? 'auto' : 'hidden',
        ...(enabled ? { scrollbarGutter: 'auto' as const } : {}),
        minWidth: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
});
