'use client';

import Typography from '@mui/material/Typography';
import type { ProductSort } from '@my-noodles/api-clients/storefront';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';

import { useProductsInfiniteList } from '@/api/products';
import { ProductGrid } from '@/components/catalog/product-grid/product-grid';
import { useViewItemList } from '@/hooks/analytics';
import { toCatalogInfiniteListParams, useCatalogSearchParams } from '@/screens/catalog/search-params';
import { trackCatalogLoadMore } from '@/shared/analytics';

import { catalogGridProducts, type CatalogProductGridSharedProps } from './catalog-grid-shared';
import { useClearViewModeReset } from './use-clear-view-mode-reset';

export function CatalogInfiniteGrid({
  onOpenFilters,
  isViewModeResetting,
  clearViewModeReset,
  viewMode,
  listTitle,
}: CatalogProductGridSharedProps) {
  const t = useTranslations('catalog');
  const { params, setParams, hasFiltersApplied } = useCatalogSearchParams();
  const previousCountRef = useRef(0);
  const infiniteListParams = useMemo(() => toCatalogInfiniteListParams(params), [params]);

  const {
    products,
    productsTotal,
    productsIsInitialLoad,
    productsIsError,
    productsIsRefetching,
    productsIsBusy,
    productsHasNextPage,
    productsIsFetchingNextPage,
    productsFetchNextPage,
  } = useProductsInfiniteList(infiniteListParams);

  const displayItems = products;
  const totalCount = productsTotal ?? 0;
  const isInitialLoad = productsIsInitialLoad;
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
    if (isViewModeResetting) {
      previousCountRef.current = 0;
    }
  }, [isViewModeResetting]);

  useEffect(() => {
    previousCountRef.current = 0;
  }, [infiniteListParams]);

  useEffect(() => {
    if (showSkeleton || productsIsError) {
      return;
    }

    const itemsVisible = displayItems.length;
    if (itemsVisible <= previousCountRef.current) {
      return;
    }

    if (previousCountRef.current === 0) {
      previousCountRef.current = itemsVisible;
      return;
    }

    const infinitePage = Math.ceil(itemsVisible / params.limit);
    trackCatalogLoadMore(infinitePage, itemsVisible);
    previousCountRef.current = itemsVisible;
  }, [displayItems.length, params.limit, productsIsError, showSkeleton]);

  useViewItemList('catalog', listTitle, displayItems, !showSkeleton && !productsIsError, viewMode);

  if (productsIsError) {
    return <Typography color="error">{t('error')}</Typography>;
  }

  return (
    <ProductGrid
      products={gridProducts}
      totalCount={showSkeleton ? undefined : totalCount}
      showResultsCount
      sort={params.sort}
      onSortChange={(sort: ProductSort) => void setParams({ sort, page: 1 })}
      onOpenFilters={onOpenFilters}
      hasFiltersApplied={hasFiltersApplied}
      loadMore={
        showSkeleton
          ? undefined
          : {
              hasMore: productsHasNextPage,
              isLoading: productsIsFetchingNextPage,
              onLoadMore: () => void productsFetchNextPage(),
            }
      }
      isPending={showSkeleton}
      isFetching={productsIsRefetching}
      skeletonCount={params.limit}
    />
  );
}
