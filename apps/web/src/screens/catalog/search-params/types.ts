import {
  type ProductFacetOptionDto,
  type ProductFacetsDto,
  ProductSort,
} from '@my-noodles/api-clients/storefront';

import type { CatalogSearchParams } from './parsers';

export type CatalogFilterParams = Omit<CatalogSearchParams, 'page' | 'limit'>;

export type CatalogInfiniteListParams = Omit<CatalogSearchParams, 'page'>;

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

export function toCatalogInfiniteListParams(params: CatalogSearchParams): CatalogInfiniteListParams {
  const { page: _page, ...listParams } = params;
  return listParams;
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

export function hasCatalogFiltersApplied(params: CatalogSearchParams): boolean {
  return (
    catalogFiltersAppliedKey(params) !==
    catalogFiltersAppliedKey({
      ...params,
      ...DEFAULT_CATALOG_FILTER_PARAMS,
      collection: null,
    })
  );
}

export function hasCatalogClearableState(params: CatalogSearchParams): boolean {
  return hasCatalogFiltersApplied(params) || params.sort !== ProductSort.POPULAR || params.page > 1;
}
