'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import { CartPanelHost } from '@/components/cart/cart-panel-host';
import { NavigationBusyOverlay } from '@/components/navigation/navigation-busy-overlay';
import { NavigationPendingProvider } from '@/hooks/smooth';
import { usePathname } from '@/i18n/navigation';

import { SiteHeader } from './site-header';
import { isImmersiveRoute, SITE_HEADER_HEIGHT } from './site-nav-config';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const immersive = isImmersiveRoute(pathname);

  return (
    <NavigationPendingProvider>
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          ...(immersive ? { height: '100dvh', overflow: 'hidden' } : undefined),
        }}
      >
        {!immersive ? <SiteHeader /> : null}
        <NavigationBusyOverlay topOffset={immersive ? 0 : SITE_HEADER_HEIGHT}>
          {children}
        </NavigationBusyOverlay>
        <CartPanelHost />
      </Box>
    </NavigationPendingProvider>
  );
}
