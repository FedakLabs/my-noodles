import { ProductSort } from '@my-noodles/api-clients/storefront';

import type { CatalogFacetsParams, CatalogSearchParams } from '@/screens/catalog/search-params';
import { DEFAULT_CATALOG_FILTER_PARAMS, toCatalogFacetsParams } from '@/screens/catalog/search-params';

export const LANDING_HERO_PRODUCTS_LIMIT = 8;

export const LANDING_HERO_PRODUCTS_PARAMS: CatalogSearchParams = {
  ...DEFAULT_CATALOG_FILTER_PARAMS,
  isTriedByUs: true,
  inStock: true,
  sort: ProductSort.POPULAR,
  page: 1,
  limit: LANDING_HERO_PRODUCTS_LIMIT,
};

export const LANDING_TRIED_COUNT_PARAMS: CatalogSearchParams = {
  ...LANDING_HERO_PRODUCTS_PARAMS,
  limit: 1,
};

export const LANDING_FACETS_PARAMS: CatalogFacetsParams = toCatalogFacetsParams({
  ...DEFAULT_CATALOG_FILTER_PARAMS,
});
