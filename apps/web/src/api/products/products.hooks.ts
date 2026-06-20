'use client';

import { useQuery } from '@tanstack/react-query';

import { useAppLocale } from '@/hooks/locale';

import { formatUseQuery } from '../_lib/queries';
import { fetchProductDetail, fetchProductFacets, fetchProductsList, productsQueryKeys } from './products';
import type { ProductFacetQueryFilters, ProductListQueryFilters } from './types';

export function useProductsList(filters: ProductListQueryFilters) {
  const locale = useAppLocale();
  const resolvedFilters = { ...filters, locale };

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.list(resolvedFilters),
      queryFn: () => fetchProductsList(resolvedFilters),
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
    }),
    'product',
  );
}

export function useProductFacets(filters: ProductFacetQueryFilters) {
  const locale = useAppLocale();
  const resolvedFilters = { ...filters, locale };

  return formatUseQuery(
    useQuery({
      queryKey: productsQueryKeys.facets(resolvedFilters),
      queryFn: () => fetchProductFacets(resolvedFilters),
    }),
    'productFacets',
  );
}
