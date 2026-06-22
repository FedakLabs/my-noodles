'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { StableLinearProgress } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useNavigationSmoothBusy } from '@/hooks/smooth';

import { SmoothBusyVeil } from './smooth-busy-veil';

type NavigationBusyOverlayProps = {
  children: ReactNode;
};

export function NavigationBusyOverlay({ children }: NavigationBusyOverlayProps) {
  const t = useTranslations('common');
  const theme = useTheme();
  const { mounted, active, transitionMs, transitionEasing } = useNavigationSmoothBusy();
  const toolbarHeight = theme.mixins.toolbar.minHeight;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: toolbarHeight,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        <StableLinearProgress
          active={active}
          transitionMs={transitionMs}
          transitionEasing={transitionEasing}
          aria-label={t('loading')}
        />
      </Box>

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>
        {children}

        {mounted ? (
          <SmoothBusyVeil
            visible={active}
            label={t('loading')}
            transitionMs={transitionMs}
            transitionEasing={transitionEasing}
            position="fixed"
            top={toolbarHeight}
            zIndex={theme.zIndex.modal - 2}
            borderRadius={0}
          />
        ) : null}
      </Box>
    </>
  );
}
