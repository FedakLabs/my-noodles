import { parseAsString } from 'nuqs';

export const PRODUCT_SEARCH_FIELDS = ['slug', 'name'] as const;

export type ProductSearchField = (typeof PRODUCT_SEARCH_FIELDS)[number];

export const productsSearchParamsParsers = {
  slug: parseAsString,
  name: parseAsString,
};
