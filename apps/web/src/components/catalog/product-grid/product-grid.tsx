'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProductSort, ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import { layoutDisplay } from '@my-noodles/theme';
import {
  BusyArea,
  type BusyAreaState,
  iconStyle,
  resolveSmoothMotionTokens,
  StableLinearProgress,
  useBusyAreaState,
} from '@my-noodles/ui';
import FilterIcon from '@my-noodles/ui/icons/filter.svg';
import { useTranslations } from 'next-intl';

import { CatalogViewModeMenu } from '@/components/catalog-view-mode';
import { CatalogEmptyState } from '@/components/catalog/catalog-empty-state';
import { CatalogLoadMore } from '@/components/catalog/catalog-load-more';
import { CatalogLoadMoreButton } from '@/components/catalog/catalog-load-more-button';
import { CatalogPagination } from '@/components/catalog/catalog-pagination';
import { CatalogSortMenu } from '@/components/catalog/catalog-sort-menu';

import { ProductCard } from '../product-card/product-card';
import { useCatalogGridColumns } from '../product-card/use-catalog-grid-columns';
import { ProductGridSkeleton } from './product-grid-skeleton';

type ProductGridPagination = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

type ProductGridLoadMore = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
};

type ProductGridPaginationLoadMore = {
  isLoading: boolean;
  onLoadMore: () => void;
};

type ProductGridProps = {
  products: ProductSummaryDto[];
  totalCount?: number;
  showResultsCount?: boolean;
  sort?: ProductSort;
  onSortChange?: (sort: ProductSort) => void;
  onOpenFilters?: () => void;
  hasFiltersApplied?: boolean;
  pagination?: ProductGridPagination;
  paginationLoadMore?: ProductGridPaginationLoadMore;
  loadMore?: ProductGridLoadMore;
  isPending?: boolean;
  isFetching?: boolean;
  skeletonCount?: number;
};

function ProductGridToolbar({
  statusText,
  searchingText,
  showSearchingText,
  isBusy,
  sort,
  onSortChange,
  pagination,
  onOpenFilters,
  hasFiltersApplied,
  progressActive,
  progressLabel,
  timing,
}: {
  statusText: string;
  searchingText: string;
  showSearchingText: boolean;
  isBusy: boolean;
  sort?: ProductSort;
  onSortChange?: (sort: ProductSort) => void;
  pagination?: ProductGridPagination;
  onOpenFilters?: () => void;
  hasFiltersApplied?: boolean;
  progressActive: boolean;
  progressLabel: string;
  timing: BusyAreaState;
}) {
  const t = useTranslations('catalog');
  const progressMotion = resolveSmoothMotionTokens();
  const showSort = sort != null && onSortChange != null;
  const showPageNav = pagination != null;
  const showPageStatus = showPageNav;

  return (
    <Stack spacing={0.75}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, minWidth: 0 }}
      >
        <BusyArea timing={timing} dim scrim={false} label={progressLabel}>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              minWidth: 0,
              flexWrap: 'wrap',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2" sx={{ minWidth: 0, color: 'inherit' }}>
              {showSearchingText ? searchingText : statusText}
            </Typography>
            {!showSearchingText && showPageStatus ? (
              <>
                <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 20 }} />
                <Typography variant="body2" sx={{ color: 'inherit', flexShrink: 0 }}>
                  {t('pageOfTotal', { page: pagination.page, pageCount: pagination.pageCount })}
                </Typography>
              </>
            ) : null}
          </Stack>
        </BusyArea>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', color: 'text.secondary', flexShrink: 0 }}
        >
          {onOpenFilters ? (
            <Box sx={{ display: layoutDisplay.mobileOnlyFlex, alignItems: 'center' }}>
              <IconButton
                size="small"
                disabled={isBusy}
                aria-label={t('openFilters')}
                onClick={onOpenFilters}
                sx={{ color: hasFiltersApplied ? 'primary.main' : 'inherit', p: 0.25 }}
              >
                <FilterIcon aria-hidden style={iconStyle({ size: 20, color: 'inherit' })} />
              </IconButton>
            </Box>
          ) : null}
          {showSort ? <CatalogSortMenu value={sort} onChange={onSortChange} disabled={isBusy} /> : null}
          {showSort ? (
            <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 20 }} />
          ) : null}
          <CatalogViewModeMenu disabled={isBusy} />
        </Stack>
      </Stack>

      <StableLinearProgress
        active={progressActive}
        transitionMs={progressMotion.transitionMs}
        transitionEasing={progressMotion.transitionEasing}
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
  pagination,
  paginationLoadMore,
  loadMore,
  onOpenFilters,
  hasFiltersApplied,
  isPending,
  isFetching,
  skeletonCount = 8,
}: ProductGridProps) {
  const t = useTranslations('catalog');
  const isInitialLoad = Boolean(isPending && products.length === 0);
  const isRefetching = Boolean(isFetching && !isPending);
  const paginationBusy = Boolean(isFetching);
  const catalogBusyTiming = { minVisibleMs: 0, showDelayMs: 0 } as const;
  const timing = useBusyAreaState(isRefetching, catalogBusyTiming);
  const showGridBusyOverlay = isRefetching && products.length > 0;
  const hasStatusData = totalCount != null;
  const showSearchingText = isRefetching && !hasStatusData;
  const showToolbar = showResultsCount || (sort != null && onSortChange != null) || pagination != null;
  const gridColumns = useCatalogGridColumns();

  if (isInitialLoad) {
    return (
      <Stack spacing={2}>
        {showToolbar ? (
          <ProductGridToolbar
            statusText={t('loading')}
            searchingText={t('filters.searching')}
            showSearchingText={false}
            isBusy={false}
            sort={sort}
            onSortChange={onSortChange}
            pagination={pagination}
            onOpenFilters={onOpenFilters}
            hasFiltersApplied={hasFiltersApplied}
            progressActive={false}
            progressLabel={t('filters.searching')}
            timing={timing}
          />
        ) : null}
        <ProductGridSkeleton count={skeletonCount} />
      </Stack>
    );
  }

  const statusText = t('resultsCount', { count: totalCount ?? 0 });
  const searchingText = t('filters.searching');
  const paginationProps = pagination
    ? {
        page: pagination.page,
        pageCount: pagination.pageCount,
        onPageChange: pagination.onPageChange,
      }
    : null;

  return (
    <Stack spacing={2}>
      {showToolbar ? (
        <ProductGridToolbar
          statusText={statusText}
          searchingText={searchingText}
          showSearchingText={showSearchingText}
          isBusy={isRefetching}
          sort={sort}
          onSortChange={onSortChange}
          pagination={pagination}
          onOpenFilters={onOpenFilters}
          hasFiltersApplied={hasFiltersApplied}
          progressActive={isRefetching}
          progressLabel={searchingText}
          timing={timing}
        />
      ) : null}

      {products.length === 0 ? (
        <CatalogEmptyState />
      ) : (
        <BusyArea timing={timing} show={showGridBusyOverlay} label={searchingText}>
          <Grid container spacing={2}>
            {products.map((product, index) => (
              <Grid key={product.id} size={{ xs: 6, sm: 4, md: 4 }} sx={{ minWidth: 0, display: 'flex' }}>
                <ProductCard product={product} gridIndex={index} gridColumns={gridColumns} />
              </Grid>
            ))}
          </Grid>
        </BusyArea>
      )}

      {paginationLoadMore ? (
        <CatalogLoadMoreButton
          onLoadMore={paginationLoadMore.onLoadMore}
          isLoading={paginationLoadMore.isLoading}
        />
      ) : null}

      {paginationProps ? (
        <CatalogPagination disabled={paginationBusy} sx={{ alignSelf: 'center' }} {...paginationProps} />
      ) : null}

      {loadMore ? <CatalogLoadMore {...loadMore} /> : null}
    </Stack>
  );
}
