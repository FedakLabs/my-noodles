import {
  type PaginatedProductsDto,
  type ProductDetailDto,
  type ProductFacetsResponseDto,
  productsControllerGetBySlug,
  productsControllerGetFacets,
  productsControllerList,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';
import type { QueryClient } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';
import type {
  CatalogFacetsParams,
  CatalogInfiniteListParams,
  CatalogSearchParams,
} from '@/screens/catalog/search-params';
import { toCatalogInfiniteListParams } from '@/screens/catalog/search-params';

import { searchParamsToFacetsQuery, searchParamsToListQuery } from './utils';

const productsQueryKeyRoot = ['products'] as const;

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

/** Merges a catalog page into the accumulated pagination cache. */
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

export async function fetchProductDetail(slug: string): Promise<ProductDetailDto> {
  return requestData(
    productsControllerGetBySlug({
      path: { slug },
    }),
  );
}

export async function fetchProductFacets(params: CatalogFacetsParams): Promise<ProductFacetsResponseDto> {
  return requestData(productsControllerGetFacets({ query: searchParamsToFacetsQuery(params) }));
}
