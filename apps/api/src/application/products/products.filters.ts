import type { PaginationQuery } from '@my-noodles/api-lib/pagination';
import type { FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { Between, In, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';

import type { Product } from './product.entity';
import type { ProductFilters } from './products.filter-query.dto';

export type { ProductFacetFilters, ProductFilters } from './products.filter-query.dto';

export const PRODUCT_SORT_OPTIONS = ['popular', 'new', 'price-asc', 'price-desc'] as const;

export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number];

/** Shared OpenAPI enum schema — `enumName` must match generated client types. */
export const PRODUCT_SORT_OPENAPI = {
  enum: PRODUCT_SORT_OPTIONS,
  enumName: 'ProductSort',
} as const;

export const DEFAULT_PRODUCT_SORT = PRODUCT_SORT_OPTIONS[0];

const PRODUCT_SORT_ORDER: Record<ProductSort, FindOptionsOrder<Product>> = {
  popular: { sortWeight: 'DESC', createdAt: 'DESC' },
  new: { createdAt: 'DESC' },
  'price-asc': { priceMinor: 'ASC' },
  'price-desc': { priceMinor: 'DESC' },
};

export type ProductListPagination = PaginationQuery;

/** Type-safe `find` / `count` filter — prefer over query-builder string columns. */
export function buildProductWhere(filters: ProductFilters): FindOptionsWhere<Product> {
  const where: FindOptionsWhere<Product> = {};

  if (filters.collection) {
    where.collections = { code: filters.collection };
  }

  if (filters.category?.length) {
    where.category = { slug: In(filters.category) };
  }

  if (filters.country?.length) {
    where.country = { slug: In(filters.country) };
  }

  if (filters.brand) {
    where.brand = { slug: filters.brand };
  }

  if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
    where.priceMinor = Between(filters.priceMin, filters.priceMax);
  } else if (filters.priceMin !== undefined) {
    where.priceMinor = MoreThanOrEqual(filters.priceMin);
  } else if (filters.priceMax !== undefined) {
    where.priceMinor = LessThanOrEqual(filters.priceMax);
  }

  if (filters.isTriedByUs === true) {
    where.isTriedByUs = true;
  }

  if (filters.inStock === true) {
    where.quantity = MoreThan(0);
  }

  return where;
}

export function buildProductOrder(sort: ProductSort = DEFAULT_PRODUCT_SORT): FindOptionsOrder<Product> {
  return PRODUCT_SORT_ORDER[sort];
}

/** Scope for stable price slider bounds — collection context only, not other active filters. */
export function buildProductPriceBoundsScope(filters: ProductFilters): ProductFilters {
  return filters.collection ? { collection: filters.collection } : {};
}

export const productListRelations = {
  brand: true,
  country: true,
  category: true,
} as const;

export const productFacetSelect = {
  id: true,
  priceMinor: true,
  isTriedByUs: true,
  quantity: true,
  category: {
    id: true,
    slug: true,
    name: true,
  },
  country: {
    id: true,
    slug: true,
    name: true,
  },
} as const;
