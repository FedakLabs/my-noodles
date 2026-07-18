'use client';

import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { useProductsPaginatedList } from '@/api/products';
import { ProductGrid } from '@/components/catalog/product-grid/product-grid';
import { useViewItemList } from '@/hooks/analytics';
import { useCatalogSearchParams } from '@/screens/catalog/search-params';
import { trackCatalogLoadMore, trackCatalogPaginate } from '@/shared/analytics';

import { catalogGridProducts, type CatalogProductGridSharedProps } from './catalog-grid-shared';
import { useClearViewModeReset } from './use-clear-view-mode-reset';

export function CatalogPaginatedGrid({
  isViewModeResetting,
  clearViewModeReset,
  viewMode,
  listTitle,
}: CatalogProductGridSharedProps) {
  const t = useTranslations('catalog');
  const { params, setParams } = useCatalogSearchParams();
  const previousPageRef = useRef(params.page);
  const skipScrollOnPageChangeRef = useRef(false);

  const {
    products: paginatedProducts,
    productsIsInitialLoad,
    productsIsError,
    productsIsBusy,
    productsIsFetching,
  } = useProductsPaginatedList(params);

  const displayItems = paginatedProducts?.items ?? [];
  const totalCount = paginatedProducts?.meta.total ?? 0;
  const pageCount = Math.max(Math.ceil(totalCount / params.limit), 1);
  const hasMorePages = params.page < pageCount;
  const isLoadMoreFetching = productsIsFetching && params.page * params.limit > displayItems.length;
  const showLoadMore = hasMorePages || isLoadMoreFetching;
  const isInitialLoad = productsIsInitialLoad && displayItems.length === 0;
  const showSkeleton = isViewModeResetting || isInitialLoad;
  const gridProducts = catalogGridProducts(showSkeleton, displayItems);

  useClearViewModeReset({
    isViewModeResetting,
    clearViewModeReset,
    productsIsBusy,
    itemCount: displayItems.length,
    isError: productsIsError,
  });

  useEffect(() => {
    if (previousPageRef.current === params.page) {
      return;
    }

    if (skipScrollOnPageChangeRef.current) {
      skipScrollOnPageChangeRef.current = false;
      previousPageRef.current = params.page;
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    previousPageRef.current = params.page;
  }, [params.page]);

  const handleLoadMore = () => {
    const nextPage = params.page + 1;
    skipScrollOnPageChangeRef.current = true;
    trackCatalogLoadMore(nextPage, displayItems.length);
    void setParams({ page: nextPage });
  };

  useViewItemList('catalog', listTitle, displayItems, !showSkeleton && !productsIsError, viewMode);

  if (productsIsError) {
    return <Typography color="error">{t('error')}</Typography>;
  }

  return (
    <ProductGrid
      products={gridProducts}
      pagination={
        showSkeleton
          ? undefined
          : {
              page: params.page,
              pageCount,
              onPageChange: (page) => {
                trackCatalogPaginate(page, pageCount);
                void setParams({ page });
              },
            }
      }
      paginationLoadMore={
        showLoadMore && !showSkeleton
          ? {
              isLoading: isLoadMoreFetching,
              onLoadMore: handleLoadMore,
            }
          : undefined
      }
      isPending={showSkeleton}
      skeletonCount={params.limit}
    />
  );
}
