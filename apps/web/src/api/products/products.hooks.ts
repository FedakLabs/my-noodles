'use client';

import type { PaginatedProductsDto, Product } from '@my-noodles/api-clients/storefront';
import { formatUseInfiniteQuery, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import type { CatalogFacetsParams, CatalogSearchParams } from '@/screens/catalog/search-params';
import type { CatalogInfiniteListParams } from '@/screens/catalog/search-params';
import { toCatalogInfiniteListParams } from '@/screens/catalog/search-params';

import { productsQueries, resolvePaginatedProductsPage } from './products';

type QueryEnabledOptions = {
  enabled?: boolean;
};

export function useProductsList(params: CatalogSearchParams, options?: QueryEnabledOptions) {
  return formatUseQuery(
    useQuery({
      ...productsQueries.list(params),
      enabled: options?.enabled ?? true,
    }),
    'products',
  );
}

export function useProductsPaginatedList(params: CatalogSearchParams, options?: QueryEnabledOptions) {
  const queryClient = useQueryClient();
  const listParams = useMemo(() => toCatalogInfiniteListParams(params), [params]);
  const storageKey = productsQueries.paginatedAccumulated(listParams).queryKey;
  const displayQueryKey = useMemo(() => [...storageKey, params.page] as const, [storageKey, params.page]);

  const query = useQuery({
    queryKey: displayQueryKey,
    queryFn: async () =>
      (await resolvePaginatedProductsPage(queryClient, params, undefined, 'replace')).merged,
    enabled: options?.enabled ?? true,
    // Page jumps must not keep the previous page visible after scroll-to-top.
    placeholderData: undefined,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const products = query.data;
  const hasMore = (products?.items.length ?? 0) < (products?.meta.total ?? 0);

  const loadMore = useCallback(async () => {
    const current =
      queryClient.getQueryData<PaginatedProductsDto>(displayQueryKey) ??
      queryClient.getQueryData<PaginatedProductsDto>(storageKey);
    const loadedCount = current?.items.length ?? 0;
    const total = current?.meta.total ?? 0;

    if (loadedCount === 0 || loadedCount >= total || isLoadingMore) {
      return;
    }

    const nextPage = Math.floor(loadedCount / params.limit) + 1;

    setIsLoadingMore(true);
    try {
      const { merged } = await resolvePaginatedProductsPage(
        queryClient,
        { ...params, page: nextPage },
        undefined,
        'append',
      );
      queryClient.setQueryData(displayQueryKey, merged);
    } finally {
      setIsLoadingMore(false);
    }
  }, [displayQueryKey, isLoadingMore, params, queryClient, storageKey]);

  return {
    ...formatUseQuery(query, 'products'),
    loadMore,
    isLoadingMore,
    hasMore,
  };
}

export function useProductsInfiniteList(params: CatalogInfiniteListParams, options?: QueryEnabledOptions) {
  return formatUseInfiniteQuery<PaginatedProductsDto, Product, Error, 'products'>(
    useInfiniteQuery({
      ...productsQueries.infiniteList(params),
      enabled: options?.enabled ?? true,
    }),
    'products',
  );
}

export function useProductDetail(slug: string, options?: QueryEnabledOptions) {
  return formatUseQuery(
    useQuery({
      ...productsQueries.detail(slug),
      enabled: options?.enabled ?? true,
    }),
    'product',
  );
}

export function useProductFacets(params: CatalogFacetsParams) {
  return formatUseQuery(useQuery(productsQueries.facets(params)), 'productFacets');
}
