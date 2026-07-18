import type { PaginationQuery } from '@my-noodles/api-lib/pagination';
import type { FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { Between, In, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';

import type { Product } from './product.entity';
import type { ProductFilterQueryDto, ProductFilters } from './products.filter-query.dto';

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

export type ProductFacetDimension = {
  [K in keyof ProductFilterQueryDto]: NonNullable<ProductFilterQueryDto[K]> extends string[] ? K : never;
}[keyof ProductFilterQueryDto];

/** Facet counts for one dimension ignore that dimension's filter (OR within facet, AND across facets). */
export function buildProductWhereForFacet(
  filters: ProductFilters,
  omit: ProductFacetDimension,
): FindOptionsWhere<Product> {
  const scoped = { ...filters };

  switch (omit) {
    case 'category':
      delete scoped.category;
      break;
    case 'country':
      delete scoped.country;
      break;
    case 'brand':
      delete scoped.brand;
      break;
  }

  return buildProductWhere(scoped);
}

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

  if (filters.brand?.length) {
    where.brand = { slug: In(filters.brand) };
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
  brand: {
    id: true,
    slug: true,
    name: true,
  },
} as const;
