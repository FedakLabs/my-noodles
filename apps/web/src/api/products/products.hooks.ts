'use client';

import type { PaginatedProductsDto, Product } from '@my-noodles/api-clients/storefront';
import { formatUseInfiniteQuery, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

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
