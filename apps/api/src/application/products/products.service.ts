import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationHelper } from '@/utils/pagination';

import { Product } from './product.entity';
import type {
  PaginatedProductsDto,
  ProductDetailDto,
  ProductFacetsResponseDto,
  ProductSummaryDto,
} from './products.dto';
import { ProductNotFoundException } from './products.exceptions';
import type { ProductFilters, ProductListPagination } from './products.filters';
import {
  buildProductOrder,
  buildProductWhere,
  productFacetSelect,
  productListRelations,
} from './products.filters';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async list(filters: ProductFilters & ProductListPagination): Promise<PaginatedProductsDto> {
    const { items: rows, meta } = await PaginationHelper.paginate(this.productsRepository, filters, {
      where: buildProductWhere(filters),
      relations: productListRelations,
      order: buildProductOrder(filters.sort),
    });

    return {
      items: rows.map((product) => this.toSummary(product)),
      meta,
    };
  }

  async getFacets(filters: ProductFilters): Promise<ProductFacetsResponseDto> {
    const products = await this.productsRepository.find({
      where: buildProductWhere(filters),
      relations: {
        category: true,
        country: true,
      },
      select: productFacetSelect,
    });

    return this.buildFacetsResponse(products);
  }

  async getBySlug(slug: string): Promise<ProductDetailDto> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: {
        brand: true,
        country: true,
        category: true,
        alternatives: {
          brand: true,
          country: true,
          category: true,
        },
      },
    });

    if (!product) {
      throw new ProductNotFoundException(slug);
    }

    const summary = this.toSummary(product);

    return {
      ...summary,
      weight: product.weight,
      description: product.description.localized,
      story: product.story.localized,
      forWhom: product.forWhom.localized,
      flavor: product.flavor,
      allergens: product.allergens,
      alternatives: (product.alternatives ?? []).map((alternative) => this.toSummary(alternative)),
    };
  }

  private buildFacetsResponse(products: Product[]): ProductFacetsResponseDto {
    const categoryCounts = new Map<string, { name: Product['category']['name']; count: number }>();
    const countryCounts = new Map<string, { name: Product['country']['name']; count: number }>();

    let priceMin = Number.POSITIVE_INFINITY;
    let priceMax = 0;
    let isTriedByUs = 0;
    let inStock = 0;

    for (const product of products) {
      const categoryEntry = categoryCounts.get(product.category.slug);
      if (categoryEntry) {
        categoryEntry.count += 1;
      } else {
        categoryCounts.set(product.category.slug, { name: product.category.name, count: 1 });
      }

      const countryEntry = countryCounts.get(product.country.slug);
      if (countryEntry) {
        countryEntry.count += 1;
      } else {
        countryCounts.set(product.country.slug, { name: product.country.name, count: 1 });
      }

      priceMin = Math.min(priceMin, product.priceMinor);
      priceMax = Math.max(priceMax, product.priceMinor);

      if (product.isTriedByUs) {
        isTriedByUs += 1;
      }

      if (product.quantity > 0) {
        inStock += 1;
      }
    }

    return {
      total: products.length,
      facets: {
        category: [...categoryCounts.entries()].map(([value, entry]) => ({
          value,
          label: entry.name.localized,
          count: entry.count,
        })),
        country: [...countryCounts.entries()].map(([value, entry]) => ({
          value,
          label: entry.name.localized,
          count: entry.count,
        })),
        price: {
          min: products.length === 0 ? 0 : priceMin,
          max: products.length === 0 ? 0 : priceMax,
        },
        isTriedByUs,
        inStock,
      },
    };
  }

  private toSummary(product: Product): ProductSummaryDto {
    return {
      slug: product.slug,
      name: product.name.localized,
      priceMinor: product.priceMinor,
      currency: product.currency,
      images: product.images,
      inStock: product.quantity > 0,
      isTriedByUs: product.isTriedByUs,
      sortWeight: product.sortWeight,
      brand: product.brand
        ? {
            slug: product.brand.slug,
            name: product.brand.name,
          }
        : null,
      country: {
        slug: product.country.slug,
        code: product.country.code,
        name: product.country.name.localized,
      },
      category: {
        slug: product.category.slug,
        name: product.category.name.localized,
      },
    };
  }
}
