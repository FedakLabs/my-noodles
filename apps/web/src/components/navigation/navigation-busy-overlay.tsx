'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { BusyArea, StableLinearProgress } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useNavigationSmoothBusy } from '@/hooks/smooth';

type NavigationBusyOverlayProps = {
  children: ReactNode;
};

export function NavigationBusyOverlay({ children }: NavigationBusyOverlayProps) {
  const t = useTranslations('common');
  const theme = useTheme();
  const timing = useNavigationSmoothBusy();
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
          active={timing.active}
          transitionMs={timing.transitionMs}
          transitionEasing={timing.transitionEasing}
          aria-label={t('loading')}
        />
      </Box>

      <BusyArea
        timing={timing}
        scrim
        dim={false}
        position="fixed"
        top={toolbarHeight}
        zIndex={theme.zIndex.modal - 2}
        borderRadius={0}
        label={t('loading')}
        sx={{ position: 'relative', flex: 1, minHeight: 0 }}
      >
        {children}
      </BusyArea>
    </>
  );
}
