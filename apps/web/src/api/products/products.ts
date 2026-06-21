import {
  type Locale,
  type PaginatedProductsDto,
  type ProductDetailDto,
  type ProductFacetsResponseDto,
  productsControllerGetBySlug,
  productsControllerGetFacets,
  productsControllerList,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

import type { CatalogFacetsParams, CatalogSearchParams } from '@/screens/catalog/search-params';

import { searchParamsToFacetsQuery, searchParamsToListQuery } from './utils';

export const productsQueryKeys = {
  all: ['products'] as const,
  list: (params: CatalogSearchParams, locale: Locale) =>
    [...productsQueryKeys.all, 'list', locale, params] as const,
  detail: (slug: string, locale: Locale) => [...productsQueryKeys.all, 'detail', slug, locale] as const,
  facets: (params: CatalogFacetsParams, locale: Locale) =>
    [...productsQueryKeys.all, 'facets', locale, params] as const,
};

export async function fetchProductsList(
  params: CatalogSearchParams,
  locale: Locale,
): Promise<PaginatedProductsDto> {
  return requestData(productsControllerList({ query: searchParamsToListQuery(params, locale) }));
}

export async function fetchProductDetail(slug: string, locale: Locale): Promise<ProductDetailDto> {
  return requestData(
    productsControllerGetBySlug({
      path: { slug },
      query: { locale },
    }),
  );
}

export async function fetchProductFacets(
  params: CatalogFacetsParams,
  locale: Locale,
): Promise<ProductFacetsResponseDto> {
  return requestData(productsControllerGetFacets({ query: searchParamsToFacetsQuery(params, locale) }));
}
