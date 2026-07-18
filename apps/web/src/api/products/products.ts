import {
  type PaginatedProductsDto,
  type Product,
  type ProductFacetsResponseDto,
  productsControllerGetBySlug,
  productsControllerGetFacets,
  productsControllerList,
} from '@my-noodles/api-clients/storefront';
import { pagePaginatedGetNextPageParam, requestData } from '@my-noodles/web-lib/react-query';
import { infiniteQueryOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';
import type {
  CatalogFacetsParams,
  CatalogInfiniteListParams,
  CatalogSearchParams,
} from '@/screens/catalog/search-params';
import { toCatalogInfiniteListParams } from '@/screens/catalog/search-params';

import { searchParamsToFacetsQuery, searchParamsToListQuery } from './utils';

const productsQueryKeyRoot = ['products'] as const;

/** Facet counts for the current filter slice — safe to reuse briefly when reopening the filter UI. */
const PRODUCT_FACETS_STALE_TIME_MS = 60_000;

export const productsQueryKeys = {
  all: withAppLocaleKey(() => productsQueryKeyRoot),
  list: withAppLocaleKey((params: CatalogSearchParams) => [...productsQueryKeyRoot, 'list', params] as const),
  paginatedAccumulated: withAppLocaleKey(
    (params: CatalogInfiniteListParams) => [...productsQueryKeyRoot, 'paginatedAccumulated', params] as const,
  ),
  infiniteList: withAppLocaleKey(
    (params: CatalogInfiniteListParams) => [...productsQueryKeyRoot, 'infiniteList', params] as const,
  ),
  detail: withAppLocaleKey((slug: string) => [...productsQueryKeyRoot, 'detail', slug] as const),
  facets: withAppLocaleKey(
    (params: CatalogFacetsParams) => [...productsQueryKeyRoot, 'facets', params] as const,
  ),
};

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

export async function resolvePaginatedProductsPage(
  queryClient: QueryClient,
  params: CatalogSearchParams,
  pageData?: PaginatedProductsDto,
): Promise<{
  merged: PaginatedProductsDto;
  storageKey: ReturnType<typeof productsQueryKeys.paginatedAccumulated>;
}> {
  const storageKey = productsQueryKeys.paginatedAccumulated(toCatalogInfiniteListParams(params));
  const resolvedPageData =
    pageData ??
    queryClient.getQueryData<PaginatedProductsDto>(productsQueryKeys.list(params)) ??
    (await fetchProductsList(params));
  const cached = queryClient.getQueryData<PaginatedProductsDto>(storageKey);
  const merged = mergePaginatedProductsPage(cached, resolvedPageData, params.page, params.limit);

  queryClient.setQueryData(storageKey, merged);
  return { merged, storageKey };
}

/** Drops cached product queries for the active locale so catalog view mode refetches from scratch. */
export function removeCatalogProductsListQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: productsQueryKeys.all(), exact: false });
}

export async function fetchProductsList(params: CatalogSearchParams): Promise<PaginatedProductsDto> {
  return requestData(productsControllerList({ query: searchParamsToListQuery(params) }));
}

export async function fetchProductDetail(slug: string): Promise<Product> {
  return requestData(
    productsControllerGetBySlug({
      path: { slug },
    }),
  );
}

export async function fetchProductFacets(params: CatalogFacetsParams): Promise<ProductFacetsResponseDto> {
  return requestData(productsControllerGetFacets({ query: searchParamsToFacetsQuery(params) }));
}

export const productsQueries = {
  list: (params: CatalogSearchParams) =>
    queryOptions({
      queryKey: productsQueryKeys.list(params),
      queryFn: () => fetchProductsList(params),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: productsQueryKeys.detail(slug),
      queryFn: () => fetchProductDetail(slug),
    }),
  facets: (params: CatalogFacetsParams) =>
    queryOptions({
      queryKey: productsQueryKeys.facets(params),
      queryFn: () => fetchProductFacets(params),
      staleTime: PRODUCT_FACETS_STALE_TIME_MS,
    }),
  infiniteList: (params: CatalogInfiniteListParams) =>
    infiniteQueryOptions({
      queryKey: productsQueryKeys.infiniteList(params),
      queryFn: ({ pageParam }) => fetchProductsList({ ...params, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: pagePaginatedGetNextPageParam<Product>(),
    }),
};
