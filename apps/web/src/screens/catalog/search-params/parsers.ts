import { type ProductSort } from '@my-noodles/api-clients/storefront';
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/server';

import { DEFAULT_PRODUCT_SORT, PRODUCT_SORT_OPTIONS } from '@/api/products/constants';

const sortParser = parseAsStringEnum<ProductSort>([...PRODUCT_SORT_OPTIONS]).withDefault(
  DEFAULT_PRODUCT_SORT,
);

export const catalogSearchParamsParsers = {
  collection: parseAsString,
  category: parseAsArrayOf(parseAsString).withDefault([]),
  country: parseAsArrayOf(parseAsString).withDefault([]),
  brand: parseAsArrayOf(parseAsString).withDefault([]),
  seller: parseAsArrayOf(parseAsString).withDefault([]),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  sort: sortParser,
  isTriedByUs: parseAsBoolean,
  inStock: parseAsBoolean,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(24),
};

export const catalogSearchParamsCache = createSearchParamsCache(catalogSearchParamsParsers);

export type CatalogSearchParams = Awaited<ReturnType<typeof catalogSearchParamsCache.parse>>;
