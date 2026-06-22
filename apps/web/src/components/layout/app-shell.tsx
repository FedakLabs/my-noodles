'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { CartPanelHost } from '@/components/cart/cart-panel-host';
import { NavigationBusyOverlay } from '@/components/navigation/navigation-busy-overlay';
import { NavigationPendingProvider } from '@/hooks/smooth';

import { SiteHeader } from './site-header';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <NavigationPendingProvider>
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader />
        <NavigationBusyOverlay>{children}</NavigationBusyOverlay>
        <CartPanelHost />
      </Box>
    </NavigationPendingProvider>
  );
}
