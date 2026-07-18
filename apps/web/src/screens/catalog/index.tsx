'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { type CatalogViewMode, CatalogViewModeProvider, useViewMode } from '@/components/catalog-view-mode';
import { CatalogFeedFab } from '@/components/catalog/catalog-feed-fab';
import {
  CatalogTitle,
  CatalogToolbarControls,
  CatalogToolbarProgress,
} from '@/components/catalog/catalog-toolbar';
import { FilterChips } from '@/components/catalog/filter-chips/filter-chips';
import { FilterSheet } from '@/components/catalog/filter-sheet/filter-sheet';
import { PageContainer } from '@/components/layout/page-container';

import { CatalogInfiniteGrid } from './catalog-infinite-grid';
import { CatalogPaginatedGrid } from './catalog-paginated-grid';
import { useCatalogToolbarState } from './use-catalog-toolbar-state';

/** Keeps the title row and toolbar row the same height so filters / grid start aligned. */
const catalogHeaderSx = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: 48,
  width: '100%',
  boxSizing: 'border-box',
} as const;

export type CatalogScreenProps = {
  initialViewMode: CatalogViewMode;
  hasViewModePreference: boolean;
};

export function CatalogScreen({ initialViewMode, hasViewModePreference }: CatalogScreenProps) {
  return (
    <CatalogViewModeProvider initialViewMode={initialViewMode} hasViewModePreference={hasViewModePreference}>
      <CatalogScreenContent />
    </CatalogViewModeProvider>
  );
}

function CatalogScreenContent() {
  const t = useTranslations('catalog');
  const { isInfiniteScroll, viewMode, isViewModeResetting, clearViewModeReset } = useViewMode();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const toolbar = useCatalogToolbarState();

  const gridProps = {
    isViewModeResetting,
    clearViewModeReset,
    viewMode,
    listTitle: t('title'),
  };

  return (
    <PageContainer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { mobile: 'column', desktop: 'row' },
          gap: { mobile: 0, desktop: 3 },
          alignItems: 'start',
        }}
      >
        <Stack
          spacing={1}
          sx={{
            minWidth: 0,
            width: { mobile: '100%', desktop: 'clamp(200px, 26%, 260px)' },
            flexShrink: 0,
          }}
        >
          <Box sx={catalogHeaderSx}>
            <CatalogTitle title={toolbar.title} showClear={toolbar.showClear} onClear={toolbar.onClear} />
          </Box>

          <FilterSheet drawerOpen={mobileFiltersOpen} onDrawerClose={() => setMobileFiltersOpen(false)} />
        </Stack>

        <Stack spacing={1} sx={{ minWidth: 0, flex: 1, width: { mobile: '100%' } }}>
          <Stack sx={catalogHeaderSx}>
            <CatalogToolbarControls
              statusText={toolbar.statusText}
              searchingText={toolbar.searchingText}
              showSearchingText={toolbar.showSearchingText}
              pagination={toolbar.pagination}
              progressLabel={toolbar.progressLabel}
              timing={toolbar.timing}
              isBusy={toolbar.isBusy}
              sort={toolbar.sort}
              onSortChange={toolbar.onSortChange}
              onOpenFilters={() => setMobileFiltersOpen(true)}
              hasFiltersApplied={toolbar.hasFiltersApplied}
            />
            <CatalogToolbarProgress
              progressActive={toolbar.progressActive}
              progressLabel={toolbar.progressLabel}
            />
          </Stack>

          <Stack component="section" spacing={2} sx={{ minWidth: 0 }}>
            <FilterChips />
            {isInfiniteScroll ? (
              <CatalogInfiniteGrid {...gridProps} />
            ) : (
              <CatalogPaginatedGrid {...gridProps} />
            )}
          </Stack>
        </Stack>
      </Box>

      <CatalogFeedFab />
    </PageContainer>
  );
}
