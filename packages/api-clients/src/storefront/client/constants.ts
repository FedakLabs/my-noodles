import { ProductSort } from '../generated/types.gen';

export const PRODUCT_SORT_OPTIONS = Object.values(ProductSort) as ProductSort[];

export const DEFAULT_PRODUCT_SORT = ProductSort.POPULAR;
