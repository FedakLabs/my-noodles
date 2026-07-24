import type {
  ProductsControllerGetFacetsData,
  ProductsControllerListData,
} from '@my-noodles/api-clients/storefront';

import type { CatalogFacetsParams, CatalogSearchParams } from '@/screens/catalog/search-params';

export function searchParamsToListQuery(params: CatalogSearchParams): ProductsControllerListData['query'] {
  return {
    page: params.page,
    limit: params.limit,
    collection: params.collection ?? undefined,
    category: params.category.length > 0 ? params.category : undefined,
    country: params.country.length > 0 ? params.country : undefined,
    brand: params.brand.length > 0 ? params.brand : undefined,
    seller: params.seller.length > 0 ? params.seller : undefined,
    priceMin: params.priceMin ?? undefined,
    priceMax: params.priceMax ?? undefined,
    isTriedByUs: params.isTriedByUs ?? undefined,
    inStock: params.inStock ?? undefined,
    sort: params.sort,
  };
}

export function searchParamsToFacetsQuery(
  params: CatalogFacetsParams,
): NonNullable<ProductsControllerGetFacetsData['query']> {
  return {
    collection: params.collection ?? undefined,
    category: params.category.length > 0 ? params.category : undefined,
    country: params.country.length > 0 ? params.country : undefined,
    brand: params.brand.length > 0 ? params.brand : undefined,
    seller: params.seller.length > 0 ? params.seller : undefined,
    priceMin: params.priceMin ?? undefined,
    priceMax: params.priceMax ?? undefined,
    isTriedByUs: params.isTriedByUs ?? undefined,
    inStock: params.inStock ?? undefined,
  };
}
