'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { layoutDisplay } from '@my-noodles/theme';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useProductsInfiniteList, useProductsList } from '@/api/products';
import { FilterChips } from '@/components/catalog/filter-chips/filter-chips';
import { FilterSheet } from '@/components/catalog/filter-sheet/filter-sheet';
import { ProductGrid } from '@/components/catalog/product-grid/product-grid';
import { type CatalogViewMode, CatalogViewModeProvider, useViewMode } from '@/components/catalog-view-mode';
import { PageContainer } from '@/components/layout/page-container';
import { useViewItemList } from '@/hooks/analytics';
import { toCatalogInfiniteListParams, useCatalogSearchParams } from '@/screens/catalog/search-params';

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
  const { params, setParams, hasFiltersApplied } = useCatalogSearchParams();
  const { isInfiniteScroll } = useViewMode();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const previousPageRef = useRef(params.page);

  const infiniteListParams = useMemo(() => toCatalogInfiniteListParams(params), [params]);

  const paginatedProducts = useProductsList(params, { enabled: !isInfiniteScroll });
  const infiniteProducts = useProductsInfiniteList(infiniteListParams, { enabled: isInfiniteScroll });

  const displayItems = isInfiniteScroll
    ? infiniteProducts.products
    : (paginatedProducts.products?.items ?? []);
  const totalCount = isInfiniteScroll
    ? (infiniteProducts.productsTotal ?? 0)
    : (paginatedProducts.products?.meta.total ?? 0);
  const pageCount = Math.max(Math.ceil(totalCount / params.limit), 1);

  const isInitialLoad = isInfiniteScroll
    ? infiniteProducts.productsIsInitialLoad
    : paginatedProducts.productsIsInitialLoad;
  const isLoadFailed = isInfiniteScroll
    ? infiniteProducts.productsIsLoadFailed
    : paginatedProducts.productsIsLoadFailed;
  const isFilterRefetching = isInfiniteScroll
    ? infiniteProducts.productsIsRefetching
    : paginatedProducts.productsIsRefetching;

  useEffect(() => {
    if (isInfiniteScroll || previousPageRef.current === params.page) {
      previousPageRef.current = params.page;
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    previousPageRef.current = params.page;
  }, [isInfiniteScroll, params.page]);

  useViewItemList('catalog', t('title'), displayItems, !isInitialLoad && !isLoadFailed);

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">{t('title')}</Typography>
          <Button
            variant="outlined"
            sx={(theme) => ({
              display: layoutDisplay.mobileOnlyInlineFlex,
              ...(hasFiltersApplied
                ? {
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      borderColor: 'primary.main',
                    },
                  }
                : {
                    color: 'text.primary',
                    borderColor: 'divider',
                  }),
            })}
            onClick={() => setMobileFiltersOpen(true)}
          >
            {t('openFilters')}
          </Button>
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
          <FilterSheet mobileOpen={mobileFiltersOpen} onMobileClose={() => setMobileFiltersOpen(false)} />

          <Stack component="section" spacing={2} sx={{ minWidth: 0 }}>
            {isLoadFailed ? (
              <Typography color="error">{t('error')}</Typography>
            ) : (
              <ProductGrid
                products={displayItems}
                totalCount={totalCount}
                showResultsCount
                sort={params.sort}
                onSortChange={(sort) => void setParams({ sort, page: 1 })}
                pagination={
                  isInfiniteScroll
                    ? undefined
                    : {
                        page: params.page,
                        pageCount,
                        onPageChange: (page) => void setParams({ page }),
                      }
                }
                loadMore={
                  isInfiniteScroll
                    ? {
                        hasMore: infiniteProducts.productsHasNextPage,
                        isLoading: infiniteProducts.productsIsFetchingNextPage,
                        onLoadMore: () => void infiniteProducts.productsFetchNextPage(),
                      }
                    : undefined
                }
                isPending={isInitialLoad}
                isFetching={isFilterRefetching}
                skeletonCount={params.limit}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </PageContainer>
  );
}
