import type {
  ProductsApiProductsControllerGetFacetsRequest,
  ProductsApiProductsControllerListRequest,
} from '@my-noodles/api-clients/storefront';

import type { ProductFacetFilters, ProductListFilters } from './types';

export function buildProductListRequest(
  filters: ProductListFilters,
): ProductsApiProductsControllerListRequest {
  return {
    locale: filters.locale as ProductsApiProductsControllerListRequest['locale'],
    page: filters.page,
    limit: filters.limit,
    collection: filters.collection,
    category: filters.category,
    country: filters.country,
    brand: filters.brand,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    isTriedByUs: filters.isTriedByUs,
    inStock: filters.inStock,
    sort: filters.sort,
  };
}

export function buildProductFacetsRequest(
  filters: ProductFacetFilters,
): ProductsApiProductsControllerGetFacetsRequest {
  return {
    locale: filters.locale as ProductsApiProductsControllerGetFacetsRequest['locale'],
    collection: filters.collection,
    category: filters.category,
    country: filters.country,
    brand: filters.brand,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    isTriedByUs: filters.isTriedByUs,
    inStock: filters.inStock,
    sort: filters.sort as ProductsApiProductsControllerGetFacetsRequest['sort'],
  };
}
