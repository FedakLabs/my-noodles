'use client';

import type { PaginatedProductsDto, ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import type { FormattedInfiniteQueryResult } from '@my-noodles/web-lib/react-query';
import {
  formatUseInfiniteQuery,
  formatUseQuery,
  pagePaginatedGetNextPageParam,
} from '@my-noodles/web-lib/react-query';
import { type InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useAppLocale } from '@/hooks/locale';
import type { CatalogFacetsParams, CatalogSearchParams } from '@/screens/catalog/search-params';
import type { CatalogInfiniteListParams } from '@/screens/catalog/search-params';

import { fetchProductDetail, fetchProductFacets, fetchProductsList, productsQueryKeys } from './products';

/** Facet counts for the current filter slice — safe to reuse briefly when reopening the filter UI. */
const PRODUCT_FACETS_STALE_TIME_MS = 60_000;

type QueryEnabledOptions = {
  enabled?: boolean;
};

type UseProductsInfiniteListResult = FormattedInfiniteQueryResult<ProductSummaryDto, Error, 'products'> & {
  productsTotal: number | undefined;
  productsIsFetchingNextPage: boolean;
  productsIsInitialLoad: boolean;
  productsIsLoadFailed: boolean;
  productsIsRefetching: boolean;
};

export function useProductsList(params: CatalogSearchParams, options?: QueryEnabledOptions) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.list(params, locale),
      queryFn: () => fetchProductsList(params, locale),
      enabled: options?.enabled ?? true,
    }),
    'products',
  );
}

export function useProductsInfiniteList(
  params: CatalogInfiniteListParams,
  options?: QueryEnabledOptions,
): UseProductsInfiniteListResult {
  const locale = useAppLocale();

  const query = useInfiniteQuery<
    PaginatedProductsDto,
    Error,
    InfiniteData<PaginatedProductsDto>,
    ReturnType<typeof productsQueryKeys.infiniteList>,
    number
  >({
    queryKey: productsQueryKeys.infiniteList(params, locale),
    queryFn: ({ pageParam }) => fetchProductsList({ ...params, page: pageParam }, locale),
    initialPageParam: 1,
    getNextPageParam: pagePaginatedGetNextPageParam<ProductSummaryDto>(),
    enabled: options?.enabled ?? true,
  });

  const formatted = formatUseInfiniteQuery<PaginatedProductsDto, ProductSummaryDto, Error, 'products'>(
    query,
    'products',
  );
  const total = query.data?.pages[0]?.meta.total;

  return {
    ...formatted,
    productsTotal: total,
    productsIsFetchingNextPage: query.isFetchingNextPage,
    productsIsInitialLoad: query.isPending && query.data === undefined,
    productsIsLoadFailed: query.isError && query.data === undefined,
    productsIsRefetching: query.isRefetching && !query.isFetchingNextPage,
  };
}

export function useProductDetail(slug: string) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.detail(slug, locale),
      queryFn: () => fetchProductDetail(slug, locale),
    }),
    'product',
  );
}

export function useProductFacets(params: CatalogFacetsParams) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.facets(params, locale),
      queryFn: () => fetchProductFacets(params, locale),
      staleTime: PRODUCT_FACETS_STALE_TIME_MS,
    }),
    'productFacets',
  );
}
