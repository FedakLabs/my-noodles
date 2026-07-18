'use client';

import type { ProductSort } from '@my-noodles/api-clients/storefront';
import { useBusyAreaState } from '@my-noodles/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useProductsInfiniteList, useProductsPaginatedList } from '@/api/products';
import { useViewMode } from '@/components/catalog-view-mode';
import type { CatalogToolbarPagination } from '@/components/catalog/catalog-toolbar';
import { toCatalogInfiniteListParams, useCatalogSearchParams } from '@/screens/catalog/search-params';

export function useCatalogToolbarState() {
  const t = useTranslations('catalog');
  const { params, setParams, showClear, clearCatalog, hasFiltersApplied } = useCatalogSearchParams();
  const { isInfiniteScroll, isViewModeResetting } = useViewMode();
  const infiniteListParams = useMemo(() => toCatalogInfiniteListParams(params), [params]);

  const infinite = useProductsInfiniteList(infiniteListParams, { enabled: isInfiniteScroll });
  const paginated = useProductsPaginatedList(params, { enabled: !isInfiniteScroll });

  const isInitialLoad = isInfiniteScroll ? infinite.productsIsInitialLoad : paginated.productsIsInitialLoad;
  const isRefetching = isInfiniteScroll ? infinite.productsIsRefetching : paginated.productsIsRefetching;
  const showSkeleton = isViewModeResetting || isInitialLoad;
  const totalCount = isInfiniteScroll
    ? infinite.productsTotal
    : (paginated.products?.meta.total ?? undefined);
  const hasStatusData = !showSkeleton && totalCount != null;
  const showSearchingText = isRefetching && !hasStatusData;
  const statusText = showSkeleton ? t('loading') : t('resultsCount', { count: totalCount ?? 0 });
  const searchingText = t('filters.searching');
  const timing = useBusyAreaState(isRefetching && !showSkeleton, {
    minVisibleMs: 0,
    showDelayMs: 0,
  });

  const pageCount = Math.max(Math.ceil((totalCount ?? 0) / params.limit), 1);
  const pagination: CatalogToolbarPagination | undefined =
    !isInfiniteScroll && !showSkeleton
      ? {
          page: params.page,
          pageCount,
        }
      : undefined;

  return {
    title: t('title'),
    statusText,
    searchingText,
    showSearchingText,
    pagination,
    showClear,
    onClear: clearCatalog,
    progressLabel: searchingText,
    timing,
    isBusy: isRefetching && !showSkeleton,
    sort: params.sort,
    onSortChange: (sort: ProductSort) => {
      void setParams({ sort, page: 1 });
    },
    hasFiltersApplied,
    progressActive: isRefetching && !showSkeleton,
  };
}
