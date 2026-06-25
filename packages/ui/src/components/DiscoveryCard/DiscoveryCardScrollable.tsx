'use client';

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';

export type DiscoveryCardScrollableProps = Omit<BoxProps, 'children'> & {
  children: ReactNode;
  enabled?: boolean;
};

export const DiscoveryCardScrollable = forwardRef<HTMLDivElement, DiscoveryCardScrollableProps>(
  function DiscoveryCardScrollable({ children, enabled = true, sx, ...boxProps }, ref) {
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
  },
);
