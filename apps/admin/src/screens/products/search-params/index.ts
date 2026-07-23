import { createSerializer } from 'nuqs';

import { ROUTE_NAMES } from '@/router/route-names';

import { productsSearchParamsParsers } from './parsers';

export { useProductsSearchParams } from './hooks';
export { PRODUCT_SEARCH_FIELDS, type ProductSearchField } from './parsers';

const serializeProductsSearchParams = createSerializer(productsSearchParamsParsers);

export function productsSearchHref(search: { slug?: string | null; name?: string | null }): string {
  return serializeProductsSearchParams(ROUTE_NAMES.products, search);
}
