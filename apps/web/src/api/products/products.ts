import {
  type PaginatedProductsDto,
  type Product,
  productsControllerGetBySlug,
  productsControllerGetFacets,
  productsControllerList,
} from '@my-noodles/api-clients/storefront';
import { pagePaginatedGetNextPageParam } from '@my-noodles/web-lib/react-query';
import { infiniteQueryOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';
import type {
  CatalogFacetsParams,
  CatalogInfiniteListParams,
  CatalogSearchParams,
} from '@/screens/catalog/search-params';
import { toCatalogInfiniteListParams } from '@/screens/catalog/search-params';

import { searchParamsToFacetsQuery, searchParamsToListQuery } from './utils';

/** Facet counts for the current filter slice — safe to reuse briefly when reopening the filter UI. */
const PRODUCT_FACETS_STALE_TIME_MS = 60_000;

export function mergePaginatedProductsPage(
  cached: PaginatedProductsDto | undefined,
  pageData: PaginatedProductsDto,
  page: number,
  limit: number,
): PaginatedProductsDto {
  const cachedItems = cached?.items ?? [];

  if (page * limit > cachedItems.length) {
    const existingIds = new Set(cachedItems.map((item) => item.id));
    return {
      ...pageData,
      items: [...cachedItems, ...pageData.items.filter((item) => !existingIds.has(item.id))],
      meta: {
        ...pageData.meta,
        page,
      },
    };
  }

  return pageData;
}

export const productsQueries = {
  rootKey: ['products'] as const,
  /** Locale-prefixed root — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => productsQueries.rootKey)(),
    }),
  /** Cache storage key only — do not pass to useQuery. */
  paginatedAccumulated: (params: CatalogInfiniteListParams) =>
    queryOptions({
      queryKey: withAppLocaleKey(
        () => [...productsQueries.rootKey, 'paginatedAccumulated', params] as const,
      )(),
    }),
  list: (params: CatalogSearchParams) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...productsQueries.rootKey, 'list', params] as const)(),
      queryFn: () => productsControllerList({ query: searchParamsToListQuery(params) }),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...productsQueries.rootKey, 'detail', slug] as const)(),
      queryFn: () => productsControllerGetBySlug({ path: { slug } }),
    }),
  facets: (params: CatalogFacetsParams) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...productsQueries.rootKey, 'facets', params] as const)(),
      queryFn: () => productsControllerGetFacets({ query: searchParamsToFacetsQuery(params) }),
      staleTime: PRODUCT_FACETS_STALE_TIME_MS,
    }),
  infiniteList: (params: CatalogInfiniteListParams) =>
    infiniteQueryOptions({
      queryKey: withAppLocaleKey(() => [...productsQueries.rootKey, 'infiniteList', params] as const)(),
      queryFn: ({ pageParam }) =>
        productsControllerList({ query: searchParamsToListQuery({ ...params, page: pageParam }) }),
      initialPageParam: 1,
      getNextPageParam: pagePaginatedGetNextPageParam<Product>(),
    }),
};

export async function resolvePaginatedProductsPage(
  queryClient: QueryClient,
  params: CatalogSearchParams,
  pageData?: PaginatedProductsDto,
): Promise<{
  merged: PaginatedProductsDto;
  storageKey: ReturnType<typeof productsQueries.paginatedAccumulated>['queryKey'];
}> {
  const storageKey = productsQueries.paginatedAccumulated(toCatalogInfiniteListParams(params)).queryKey;
  const resolvedPageData =
    pageData ??
    queryClient.getQueryData<PaginatedProductsDto>(productsQueries.list(params).queryKey) ??
    (await queryClient.fetchQuery(productsQueries.list(params)));
  const cached = queryClient.getQueryData<PaginatedProductsDto>(storageKey);
  const merged = mergePaginatedProductsPage(cached, resolvedPageData, params.page, params.limit);

  queryClient.setQueryData(storageKey, merged);
  return { merged, storageKey };
}

/** Drops cached product queries for the active locale so catalog view mode refetches from scratch. */
export function removeCatalogProductsListQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: productsQueries.all().queryKey, exact: false });
}
