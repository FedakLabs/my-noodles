import type {
  ApiLocale,
  PaginatedProductsDto,
  ProductDetailDto,
  ProductFacetsResponseDto,
  ProductsApiProductsControllerGetBySlugRequest,
} from '@my-noodles/api-clients/storefront';

import { getApiClients } from '../clients';
import type { ProductFacetFilters, ProductListFilters } from './types';
import { buildProductFacetsRequest, buildProductListRequest } from './utils';

export const productsQueryKeys = {
  all: ['products'] as const,
  list: (filters: ProductListFilters) => [...productsQueryKeys.all, 'list', filters] as const,
  detail: (slug: string, locale: ApiLocale) => [...productsQueryKeys.all, 'detail', slug, locale] as const,
  facets: (filters: ProductFacetFilters) => [...productsQueryKeys.all, 'facets', filters] as const,
};

export async function fetchProductsList(filters: ProductListFilters): Promise<PaginatedProductsDto> {
  const { data } = await getApiClients().productsApi.productsControllerList(buildProductListRequest(filters));

  return data;
}

export async function fetchProductDetail(slug: string, locale: ApiLocale): Promise<ProductDetailDto> {
  const { data } = await getApiClients().productsApi.productsControllerGetBySlug({
    slug,
    locale,
  } as ProductsApiProductsControllerGetBySlugRequest);

  return data;
}

export async function fetchProductFacets(filters: ProductFacetFilters): Promise<ProductFacetsResponseDto> {
  const { data } = await getApiClients().productsApi.productsControllerGetFacets(
    buildProductFacetsRequest(filters),
  );

  return data;
}
