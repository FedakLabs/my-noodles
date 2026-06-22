'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductSort, ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import { StableLinearProgress } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';

import { CatalogEmptyState } from '@/components/catalog/catalog-empty-state';
import { CatalogSortSelect } from '@/components/catalog/catalog-sort-select';
import { SmoothBusyVeil } from '@/components/navigation/smooth-busy-veil';
import { useSmoothBusyState } from '@/hooks/smooth';

import { ProductCard } from '../product-card/product-card';
import { ProductGridSkeleton } from './product-grid-skeleton';

type ProductGridProps = {
  products: ProductSummaryDto[];
  totalCount?: number;
  showResultsCount?: boolean;
  sort?: ProductSort;
  onSortChange?: (sort: ProductSort) => void;
  isPending?: boolean;
  isFetching?: boolean;
  skeletonCount?: number;
};

function ProductGridToolbar({
  statusText,
  searchingText,
  isSearching,
  sort,
  onSortChange,
  progressActive,
  progressLabel,
  transitionMs,
  transitionEasing,
}: {
  statusText: string;
  searchingText: string;
  isSearching: boolean;
  sort?: ProductSort;
  onSortChange?: (sort: ProductSort) => void;
  progressActive: boolean;
  progressLabel: string;
  transitionMs: number;
  transitionEasing: string;
}) {
  return (
    <Stack spacing={0.75}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, minWidth: 0 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minWidth: 0,
            transition: `opacity ${transitionMs}ms ${transitionEasing}`,
            opacity: isSearching ? 0.9 : 1,
          }}
        >
          {isSearching ? searchingText : statusText}
        </Typography>
        {sort != null && onSortChange ? (
          <CatalogSortSelect value={sort} onChange={onSortChange} labelId="catalog-grid-sort-label" />
        ) : null}
      </Stack>

      <StableLinearProgress
        active={progressActive}
        transitionMs={transitionMs}
        transitionEasing={transitionEasing}
        aria-label={progressLabel}
      />
    </Stack>
  );
}

export function ProductGrid({
  products,
  totalCount,
  showResultsCount = false,
  sort,
  onSortChange,
  isPending,
  isFetching,
  skeletonCount = 8,
}: ProductGridProps) {
  const t = useTranslations('catalog');
  const isInitialLoad = Boolean(isPending && products.length === 0);
  const isRefetching = Boolean(isFetching && !isPending);
  const {
    mounted: refreshMounted,
    active: refreshActive,
    transitionMs,
    transitionEasing,
  } = useSmoothBusyState(isRefetching);
  const showToolbar = showResultsCount || (sort != null && onSortChange != null);

  if (isInitialLoad) {
    return (
      <Stack spacing={2}>
        {showToolbar ? (
          <ProductGridToolbar
            statusText={t('loading')}
            searchingText={t('filters.searching')}
            isSearching={false}
            sort={sort}
            onSortChange={onSortChange}
            progressActive={false}
            progressLabel={t('filters.searching')}
            transitionMs={transitionMs}
            transitionEasing={transitionEasing}
          />
        ) : null}
        <ProductGridSkeleton count={skeletonCount} />
      </Stack>
    );
  }

  const statusText = t('resultsCount', { count: totalCount ?? 0 });
  const searchingText = t('filters.searching');

  return (
    <Stack spacing={2}>
      {showToolbar ? (
        <ProductGridToolbar
          statusText={statusText}
          searchingText={searchingText}
          isSearching={refreshActive}
          sort={sort}
          onSortChange={onSortChange}
          progressActive={refreshActive}
          progressLabel={searchingText}
          transitionMs={transitionMs}
          transitionEasing={transitionEasing}
        />
      ) : null}

      {products.length === 0 ? (
        <CatalogEmptyState />
      ) : (
        <Box
          sx={{
            position: 'relative',
            opacity: refreshActive ? 0.9 : 1,
            transition: `opacity ${transitionMs}ms ${transitionEasing}`,
          }}
        >
          <Grid container spacing={2}>
            {products.map((product, index) => (
              <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }} sx={{ minWidth: 0 }}>
                <ProductCard product={product} priorityPrefetch={index < 4} />
              </Grid>
            ))}
          </Grid>

          {refreshMounted ? (
            <SmoothBusyVeil
              visible={refreshActive}
              label={searchingText}
              transitionMs={transitionMs}
              transitionEasing={transitionEasing}
            />
          ) : null}
        </Box>
      )}
    </Stack>
  );
}
