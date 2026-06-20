import type {
  ProductsApiProductsControllerGetFacetsRequest,
  ProductsApiProductsControllerListRequest,
} from '@my-noodles/api-clients/storefront';
import { type ProductsControllerGetFacetsSortEnum } from '@my-noodles/api-clients/storefront';

import type { ProductFacetFilters, ProductListFilters } from './types';

export function buildProductListRequest(
  filters: ProductListFilters,
): ProductsApiProductsControllerListRequest {
  return {
    locale: filters.locale,
    page: filters.page,
    limit: filters.limit,
    ...(filters.collection !== undefined ? { collection: filters.collection } : {}),
    ...(filters.category !== undefined ? { category: filters.category } : {}),
    ...(filters.country !== undefined ? { country: filters.country } : {}),
    ...(filters.brand !== undefined ? { brand: filters.brand } : {}),
    ...(filters.priceMin !== undefined ? { priceMin: filters.priceMin } : {}),
    ...(filters.priceMax !== undefined ? { priceMax: filters.priceMax } : {}),
    ...(filters.isTriedByUs !== undefined ? { isTriedByUs: filters.isTriedByUs } : {}),
    ...(filters.inStock !== undefined ? { inStock: filters.inStock } : {}),
    ...(filters.sort !== undefined ? { sort: filters.sort } : {}),
  } as ProductsApiProductsControllerListRequest;
}

export function buildProductFacetsRequest(
  filters: ProductFacetFilters,
): ProductsApiProductsControllerGetFacetsRequest {
  return {
    locale: filters.locale,
    ...(filters.collection !== undefined ? { collection: filters.collection } : {}),
    ...(filters.category !== undefined ? { category: filters.category } : {}),
    ...(filters.country !== undefined ? { country: filters.country } : {}),
    ...(filters.brand !== undefined ? { brand: filters.brand } : {}),
    ...(filters.priceMin !== undefined ? { priceMin: filters.priceMin } : {}),
    ...(filters.priceMax !== undefined ? { priceMax: filters.priceMax } : {}),
    ...(filters.isTriedByUs !== undefined ? { isTriedByUs: filters.isTriedByUs } : {}),
    ...(filters.inStock !== undefined ? { inStock: filters.inStock } : {}),
    ...(filters.sort !== undefined
      ? { sort: filters.sort as unknown as ProductsControllerGetFacetsSortEnum }
      : {}),
  } as ProductsApiProductsControllerGetFacetsRequest;
}
