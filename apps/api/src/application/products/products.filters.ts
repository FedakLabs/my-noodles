import type { FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { Between, In, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';

import type { Product } from './product.entity';

export type ProductSort = 'popular' | 'new' | 'price-asc' | 'price-desc';

export type ProductFilters = {
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

export type ProductListPagination = {
  page: number;
  limit: number;
};

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

export function buildProductOrder(sort: ProductSort = 'popular'): FindOptionsOrder<Product> {
  switch (sort) {
    case 'new':
      return { createdAt: 'DESC' };
    case 'price-asc':
      return { priceMinor: 'ASC' };
    case 'price-desc':
      return { priceMinor: 'DESC' };
    case 'popular':
    default:
      return { sortWeight: 'DESC', createdAt: 'DESC' };
  }
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
