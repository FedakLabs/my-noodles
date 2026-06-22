import {
  type ProductFacetOptionDto,
  type ProductFacetsDto,
  ProductSort,
} from '@my-noodles/api-clients/storefront';

import type { CatalogSearchParams } from './parsers';

export type CatalogFilterParams = Omit<CatalogSearchParams, 'page' | 'limit'>;

/** Multi-select facet dimensions — keys shared by URL filters and `/products/facets` response. */
export type CatalogFacetKey = {
  [K in keyof ProductFacetsDto]: ProductFacetsDto[K] extends Array<ProductFacetOptionDto> ? K : never;
}[keyof ProductFacetsDto];

/** Facet preview ignores sort — the API does not use it for counts. */
export type CatalogFacetsParams = Omit<CatalogFilterParams, 'sort'>;

export const DEFAULT_CATALOG_FILTER_PARAMS: CatalogFilterParams = {
  collection: null,
  category: [],
  country: [],
  brand: [],
  priceMin: null,
  priceMax: null,
  sort: ProductSort.POPULAR,
  isTriedByUs: null,
  inStock: null,
};

export function toCatalogFacetsParams(params: CatalogFilterParams): CatalogFacetsParams {
  const { sort: _sort, ...facetsParams } = params;
  return facetsParams;
}

/** Stable key for syncing filter UI when URL-confirmed filter params change (excludes sort, page, limit). */
export function catalogFiltersAppliedKey(params: CatalogSearchParams): string {
  return [
    params.collection ?? '',
    params.category.join('\0'),
    params.country.join('\0'),
    params.brand.join('\0'),
    params.priceMin ?? '',
    params.priceMax ?? '',
    params.isTriedByUs ?? '',
    params.inStock ?? '',
  ].join('|');
}
