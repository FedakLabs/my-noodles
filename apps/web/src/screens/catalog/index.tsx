'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { FilterChips } from '@/components/catalog/filter-chips/filter-chips';
import { FilterSheet } from '@/components/catalog/filter-sheet/filter-sheet';
import { type CatalogViewMode, CatalogViewModeProvider, useViewMode } from '@/components/catalog-view-mode';
import { PageContainer } from '@/components/layout/page-container';
import { useCatalogSearchParams } from '@/screens/catalog/search-params';

import { CatalogInfiniteGrid } from './catalog-infinite-grid';
import { CatalogPaginatedGrid } from './catalog-paginated-grid';

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
  const { showClear, clearCatalog } = useCatalogSearchParams();
  const { isInfiniteScroll, viewMode, isViewModeResetting, clearViewModeReset } = useViewMode();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const gridProps = {
    onOpenFilters: () => setMobileFiltersOpen(true),
    isViewModeResetting,
    clearViewModeReset,
    viewMode,
    listTitle: t('title'),
  };

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">{t('title')}</Typography>
          {showClear ? (
            <Button size="small" onClick={clearCatalog} sx={{ flexShrink: 0 }}>
              {t('clear')}
            </Button>
          ) : null}
        </Stack>

        <FilterChips />

        <Box
          sx={{
            display: { mobile: 'flex', desktop: 'grid' },
            flexDirection: { mobile: 'column' },
            gridTemplateColumns: { desktop: 'minmax(240px, 320px) 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <FilterSheet drawerOpen={mobileFiltersOpen} onDrawerClose={() => setMobileFiltersOpen(false)} />

          <Stack component="section" spacing={2} sx={{ minWidth: 0 }}>
            {isInfiniteScroll ? (
              <CatalogInfiniteGrid {...gridProps} />
            ) : (
              <CatalogPaginatedGrid {...gridProps} />
            )}
          </Stack>
        </Box>
      </Stack>
    </PageContainer>
  );
}
