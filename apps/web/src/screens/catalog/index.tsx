'use client';

import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { useProductsList } from '@/api/products';
import { FilterChips } from '@/components/catalog/filter-chips/filter-chips';
import { FilterSheet } from '@/components/catalog/filter-sheet/filter-sheet';
import { ProductGrid } from '@/components/catalog/product-grid/product-grid';
import { PageContainer } from '@/components/layout/page-container';
import { useViewItemList } from '@/hooks/analytics';
import { useCatalogSearchParams } from '@/screens/catalog/search-params';

export function CatalogScreen() {
  const t = useTranslations('catalog');
  const { params, setParams } = useCatalogSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [desktopFilterHeight, setDesktopFilterHeight] = useState<number>();
  const productColumnRef = useRef<HTMLDivElement | null>(null);
  const { products, productsIsInitialLoad, productsIsLoadFailed, productsIsRefetching } =
    useProductsList(params);

  useEffect(() => {
    const productColumn = productColumnRef.current;

    if (!productColumn || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateFilterHeight = () => {
      const nextHeight = Math.ceil(productColumn.getBoundingClientRect().height);
      setDesktopFilterHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    updateFilterHeight();

    const resizeObserver = new ResizeObserver(updateFilterHeight);
    resizeObserver.observe(productColumn);
    window.addEventListener('resize', updateFilterHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateFilterHeight);
    };
  }, []);

  useViewItemList('catalog', t('title'), products?.items, !productsIsInitialLoad && !productsIsLoadFailed);

  return (
    <PageContainer>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">{t('title')}</Typography>
          <Button
            variant="outlined"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            onClick={() => setMobileFiltersOpen(true)}
          >
            {t('openFilters')}
          </Button>
        </Stack>

        <FilterChips />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
          <FilterSheet
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
            desktopMaxHeight={desktopFilterHeight}
          />

          <Stack ref={productColumnRef} spacing={2} sx={{ flex: 1, width: '100%' }}>
            {productsIsLoadFailed ? (
              <Typography color="error">{t('error')}</Typography>
            ) : (
              <>
                <ProductGrid
                  products={products?.items ?? []}
                  totalCount={products?.meta.total}
                  showResultsCount
                  sort={params.sort}
                  onSortChange={(sort) => void setParams({ sort, page: 1 })}
                  isPending={productsIsInitialLoad}
                  isFetching={productsIsRefetching}
                  skeletonCount={params.limit}
                />
                {(products?.meta.total ?? 0) > params.limit ? (
                  <Pagination
                    page={params.page}
                    count={Math.ceil((products?.meta.total ?? 0) / params.limit)}
                    onChange={(_, page) => void setParams({ page })}
                    sx={{ alignSelf: 'center' }}
                  />
                ) : null}
              </>
            )}
          </Stack>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
