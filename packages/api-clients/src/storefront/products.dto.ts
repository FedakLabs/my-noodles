import {
  ProductsControllerGetFacetsSortEnum,
  ProductsControllerListSortEnum,
} from '../../generated/storefront/api/products-api';

export { ProductsControllerGetFacetsSortEnum, ProductsControllerListSortEnum };

export type ProductSort = ProductsControllerListSortEnum;

export const PRODUCT_SORT_OPTIONS = [
  ProductsControllerListSortEnum.Popular,
  ProductsControllerListSortEnum.New,
  ProductsControllerListSortEnum.PriceAsc,
  ProductsControllerListSortEnum.PriceDesc,
] as const;

export const DEFAULT_PRODUCT_SORT = ProductsControllerListSortEnum.Popular;
