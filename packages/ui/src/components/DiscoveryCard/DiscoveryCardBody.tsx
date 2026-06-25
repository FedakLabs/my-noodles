'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export type DiscoveryCardBodyProps = {
  children: ReactNode;
};

export function DiscoveryCardBody({ children }: DiscoveryCardBodyProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
}
