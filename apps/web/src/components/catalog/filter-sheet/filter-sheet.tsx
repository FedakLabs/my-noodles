'use client';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { alpha, useTheme } from '@mui/material/styles';
import { cardShadow, layoutDisplay } from '@my-noodles/theme';
import { useTranslations } from 'next-intl';

import { FilterSheetPanel } from './filter-sheet-panel';

const DESKTOP_FILTER_STICKY_TOP = 80;

export type FilterSheetProps = {
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
};

export function FilterSheet({ drawerOpen = false, onDrawerClose }: FilterSheetProps) {
  const t = useTranslations('catalog.filters');
  const theme = useTheme();

  return (
    <>
      <Box
        component="aside"
        aria-label={t('title')}
        sx={{
          display: layoutDisplay.desktopOnlyBlock,
          position: 'sticky',
          top: DESKTOP_FILTER_STICKY_TOP,
          alignSelf: 'start',
          maxHeight: `calc(100dvh - ${DESKTOP_FILTER_STICKY_TOP}px - 24px)`,
          overflow: 'hidden',
          borderRadius: `${theme.borderRadius.discovery}px`,
          border: 1,
          borderColor: alpha(theme.palette.divider, 0.9),
          bgcolor: alpha(theme.palette.background.paper, 0.88),
          backdropFilter: 'blur(12px)',
          boxShadow: cardShadow,
        }}
      >
        <Box
          sx={{
            maxHeight: 'inherit',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
          }}
        >
          <FilterSheetPanel layout="sidebar" />
        </Box>
      </Box>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={onDrawerClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          root: {
            sx: layoutDisplay.mobileOnlyBlock,
          },
          paper: {
            sx: {
              maxHeight: '85dvh',
              display: 'flex',
              flexDirection: 'column',
              overflowX: 'hidden',
            },
          },
        }}
      >
        <FilterSheetPanel />
      </Drawer>
    </>
  );
}
