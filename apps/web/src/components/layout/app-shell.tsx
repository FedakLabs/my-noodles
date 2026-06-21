'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { CartPanelHost } from '@/components/cart/cart-panel-host';

import { SiteHeader } from './site-header';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <Box component="div" sx={{ flex: 1 }}>
        {children}
      </Box>
      <CartPanelHost />
    </Box>
  );
}
