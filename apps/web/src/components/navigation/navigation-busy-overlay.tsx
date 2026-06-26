'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { StableLinearProgress } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { SITE_HEADER_HEIGHT } from '@/components/layout/site-nav-config';
import { useNavigationRawPending, useNavigationSmoothBusy } from '@/hooks/smooth';

/** Fixed bar height (px) — sits in the header/content seam during global navigation. */
export const NAVIGATION_PROGRESS_HEIGHT = 3;

type NavigationBusyOverlayProps = {
  children: ReactNode;
  topOffset?: number;
};

export function NavigationBusyOverlay({
  children,
  topOffset = SITE_HEADER_HEIGHT,
}: NavigationBusyOverlayProps) {
  const t = useTranslations('common');
  const theme = useTheme();
  const rawPending = useNavigationRawPending();
  const timing = useNavigationSmoothBusy();
  const progressVisible = rawPending || timing.mounted;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          position: 'fixed',
          top: topOffset,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          pointerEvents: 'none',
        }}
      >
        <StableLinearProgress
          active={progressVisible}
          height={NAVIGATION_PROGRESS_HEIGHT}
          color="primary"
          transitionMs={timing.transitionMs}
          transitionEasing={timing.transitionEasing}
          aria-label={t('loading')}
        />
      </Box>

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0 }}>{children}</Box>
    </Box>
  );
}
