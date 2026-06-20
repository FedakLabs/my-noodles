import type { ApiLocale, ProductSort } from '@my-noodles/api-clients/storefront';

export type {
  PaginatedProductsDto,
  ProductDetailDto,
  ProductFacetsResponseDto,
  ProductSummaryDto,
} from '@my-noodles/api-clients/storefront';

export type ProductListFilters = {
  locale: ApiLocale;
  page: number;
  limit: number;
  collection?: string;
  category?: string[];
  country?: string[];
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  isTriedByUs?: boolean;
  inStock?: boolean;
  sort?: ProductSort;
};

export type ProductFacetFilters = Omit<ProductListFilters, 'page' | 'limit'>;

/** Catalog filters for client hooks — locale comes from `useAppLocale()` inside the hook. */
export type ProductListQueryFilters = Omit<ProductListFilters, 'locale'>;

export type ProductFacetQueryFilters = Omit<ProductFacetFilters, 'locale'>;
