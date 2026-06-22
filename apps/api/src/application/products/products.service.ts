import { PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Brand } from '../brands/brand.entity';
import { Category } from '../categories/category.entity';
import { Country } from '../countries/country.entity';
import { Product } from './product.entity';
import type {
  PaginatedProductsDto,
  ProductDetailDto,
  ProductFacetOptionDto,
  ProductFacetsResponseDto,
  ProductSummaryDto,
} from './products.dto';
import { ProductNotFoundException } from './products.exceptions';
import type { ProductFacetFilters, ProductFilters, ProductListPagination } from './products.filters';
import {
  buildProductOrder,
  buildProductPriceBoundsScope,
  buildProductWhere,
  buildProductWhereForFacet,
  productFacetSelect,
  productListRelations,
} from './products.filters';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
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

  async getFacets(filters: ProductFacetFilters): Promise<ProductFacetsResponseDto> {
    const [
      filteredProducts,
      categoryScopeProducts,
      countryScopeProducts,
      brandScopeProducts,
      categories,
      countries,
      brands,
      priceScopeProducts,
    ] = await Promise.all([
      this.productsRepository.find({
        where: buildProductWhere(filters),
        select: {
          id: true,
          isTriedByUs: true,
          quantity: true,
        },
      }),
      this.productsRepository.find({
        where: buildProductWhereForFacet(filters, 'category'),
        relations: { category: true },
        select: productFacetSelect,
      }),
      this.productsRepository.find({
        where: buildProductWhereForFacet(filters, 'country'),
        relations: { country: true },
        select: productFacetSelect,
      }),
      this.productsRepository.find({
        where: buildProductWhereForFacet(filters, 'brand'),
        relations: { brand: true },
        select: productFacetSelect,
      }),
      this.categoriesRepository.find({ order: { sortOrder: 'ASC', slug: 'ASC' } }),
      this.countriesRepository.find({ order: { slug: 'ASC' } }),
      this.brandsRepository.find({ order: { slug: 'ASC' } }),
      this.productsRepository.find({
        where: buildProductWhere(buildProductPriceBoundsScope(filters)),
        select: { priceMinor: true },
      }),
    ]);

    const response = this.buildFacetsResponse({
      filteredProducts,
      categoryScopeProducts,
      countryScopeProducts,
      brandScopeProducts,
      categories,
      countries,
      brands,
    });
    response.facets.price = this.computePriceBounds(priceScopeProducts);
    return response;
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

  private buildFacetsResponse({
    filteredProducts,
    categoryScopeProducts,
    countryScopeProducts,
    brandScopeProducts,
    categories,
    countries,
    brands,
  }: {
    filteredProducts: Pick<Product, 'isTriedByUs' | 'quantity'>[];
    categoryScopeProducts: Product[];
    countryScopeProducts: Product[];
    brandScopeProducts: Product[];
    categories: Category[];
    countries: Country[];
    brands: Brand[];
  }): ProductFacetsResponseDto {
    const categoryCounts = new Map<string, number>();
    const countryCounts = new Map<string, number>();
    const brandCounts = new Map<string, number>();

    let isTriedByUs = 0;
    let inStock = 0;

    for (const product of categoryScopeProducts) {
      categoryCounts.set(product.category.slug, (categoryCounts.get(product.category.slug) ?? 0) + 1);
    }

    for (const product of countryScopeProducts) {
      countryCounts.set(product.country.slug, (countryCounts.get(product.country.slug) ?? 0) + 1);
    }

    for (const product of brandScopeProducts) {
      if (product.brand) {
        brandCounts.set(product.brand.slug, (brandCounts.get(product.brand.slug) ?? 0) + 1);
      }
    }

    for (const product of filteredProducts) {
      if (product.isTriedByUs) {
        isTriedByUs += 1;
      }

      if (product.quantity > 0) {
        inStock += 1;
      }
    }

    return {
      total: filteredProducts.length,
      facets: {
        category: this.toFacetOptions(categories, categoryCounts, (entry) => entry.name.localized),
        country: this.toFacetOptions(countries, countryCounts, (entry) => entry.name.localized),
        brand: this.toFacetOptions(brands, brandCounts, (entry) => entry.name),
        price: { min: 0, max: 0 },
        isTriedByUs,
        inStock,
      },
    };
  }

  private computePriceBounds(products: Pick<Product, 'priceMinor'>[]): { min: number; max: number } {
    if (products.length === 0) {
      return { min: 0, max: 0 };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = 0;

    for (const product of products) {
      min = Math.min(min, product.priceMinor);
      max = Math.max(max, product.priceMinor);
    }

    return { min, max };
  }

  private toFacetOptions<T extends { slug: string }>(
    taxonomy: T[],
    counts: Map<string, number>,
    labelFor: (entry: T) => string | null,
  ): ProductFacetOptionDto[] {
    return taxonomy.map((entry) => ({
      value: entry.slug,
      label: labelFor(entry),
      count: counts.get(entry.slug) ?? 0,
    }));
  }

  private toSummary(product: Product): ProductSummaryDto {
    return {
      id: product.id,
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
