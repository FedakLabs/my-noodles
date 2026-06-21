'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { useAppLocale } from '@/hooks/locale';
import type { CatalogFacetsParams, CatalogSearchParams } from '@/screens/catalog/search-params';

import { fetchProductDetail, fetchProductFacets, fetchProductsList, productsQueryKeys } from './products';

export function useProductsList(params: CatalogSearchParams) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.list(params, locale),
      queryFn: () => fetchProductsList(params, locale),
    }),
    'products',
  );
}

export function useProductDetail(slug: string) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.detail(slug, locale),
      queryFn: () => fetchProductDetail(slug, locale),
      placeholderData: undefined,
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
    }),
    'productFacets',
  );
}
