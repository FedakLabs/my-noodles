'use client';

import type { PaginatedProductsDto, ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import {
  formatUseInfiniteQuery,
  formatUseQuery,
  pagePaginatedGetNextPageParam,
} from '@my-noodles/web-lib/react-query';
import { type InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { CatalogFacetsParams, CatalogSearchParams } from '@/screens/catalog/search-params';
import type { CatalogInfiniteListParams } from '@/screens/catalog/search-params';
import { toCatalogInfiniteListParams } from '@/screens/catalog/search-params';

import {
  fetchProductDetail,
  fetchProductFacets,
  fetchProductsList,
  productsQueryKeys,
  resolvePaginatedProductsPage,
} from './products';

/** Facet counts for the current filter slice — safe to reuse briefly when reopening the filter UI. */
const PRODUCT_FACETS_STALE_TIME_MS = 60_000;

type QueryEnabledOptions = {
  enabled?: boolean;
};

export function useProductsList(params: CatalogSearchParams, options?: QueryEnabledOptions) {
  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.list(params),
      queryFn: () => fetchProductsList(params),
      enabled: options?.enabled ?? true,
    }),
    'products',
  );
}

/** Pagination view mode — URL `page` drives fetches; accumulated items live in the query cache. */
export function useProductsPaginatedList(params: CatalogSearchParams, options?: QueryEnabledOptions) {
  const queryClient = useQueryClient();
  const listParams = useMemo(() => toCatalogInfiniteListParams(params), [params]);
  const storageKey = productsQueryKeys.paginatedAccumulated(listParams);

  return formatUseQuery(
    useQuery({
      queryKey: [...storageKey, params.page],
      queryFn: async () => (await resolvePaginatedProductsPage(queryClient, params)).merged,
      enabled: options?.enabled ?? true,
    }),
    'products',
  );
}

export function useProductsInfiniteList(params: CatalogInfiniteListParams, options?: QueryEnabledOptions) {
  return formatUseInfiniteQuery<PaginatedProductsDto, ProductSummaryDto, Error, 'products'>(
    useInfiniteQuery<
      PaginatedProductsDto,
      Error,
      InfiniteData<PaginatedProductsDto>,
      ReturnType<typeof productsQueryKeys.infiniteList>,
      number
    >({
      queryKey: productsQueryKeys.infiniteList(params),
      queryFn: ({ pageParam }) => fetchProductsList({ ...params, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: pagePaginatedGetNextPageParam<ProductSummaryDto>(),
      enabled: options?.enabled ?? true,
    }),
    'products',
  );
}

export function useProductDetail(slug: string, options?: QueryEnabledOptions) {
  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.detail(slug),
      queryFn: () => fetchProductDetail(slug),
      enabled: options?.enabled ?? true,
    }),
    'product',
  );
}

export function useProductFacets(params: CatalogFacetsParams) {
  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.facets(params),
      queryFn: () => fetchProductFacets(params),
      staleTime: PRODUCT_FACETS_STALE_TIME_MS,
    }),
    'productFacets',
  );
}
