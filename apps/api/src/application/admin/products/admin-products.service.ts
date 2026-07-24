import { LocalizedString } from '@my-noodles/api-lib/locale';
import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { DEFAULT_LOCALE } from '@my-noodles/locale';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, In, Raw, type Repository } from 'typeorm';

import { Brand } from '../../brands/brand.entity';
import { Category } from '../../categories/category.entity';
import { Country } from '../../countries/country.entity';
import { Product } from '../../products/product.entity';
import { type AdminProductDto, type CreateProductDto, type UpdateProductDto } from './admin-products.dto';
import {
  AdminProductNotFoundException,
  ProductBrandNotFoundException,
  ProductCategoryNotFoundException,
  ProductCountryNotFoundException,
} from './admin-products.exceptions';

type ListAdminProductsFilters = {
  page: number;
  limit: number;
  slug?: string;
  name?: string;
  categoryId?: string[];
  brandId?: string[];
  countryId?: string[];
};

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) {}

  async list(filters: ListAdminProductsFilters): Promise<PaginatedResult<AdminProductDto>> {
    const result = await PaginationHelper.paginate(
      this.productsRepository,
      { page: filters.page, limit: filters.limit },
      { where: this.buildWhere(filters), order: { sortWeight: 'DESC', slug: 'ASC' } },
    );

    return {
      items: result.items.map((product) => this.toAdminProductDto(product)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<AdminProductDto> {
    return this.toAdminProductDto(await this.getProductOrThrow(id));
  }

  async create(dto: CreateProductDto): Promise<AdminProductDto> {
    const [country, category, brand] = await Promise.all([
      this.getCountryOrThrow(dto.countryId),
      this.getCategoryOrThrow(dto.categoryId),
      dto.brandId != null ? this.getBrandOrThrow(dto.brandId) : Promise.resolve(null),
    ]);

    const product = this.productsRepository.create({
      slug: dto.slug,
      nameLocale: new LocalizedString(dto.name),
      descriptionLocale: new LocalizedString(dto.description),
      storyLocale: new LocalizedString(dto.story),
      forWhomLocale: new LocalizedString(dto.forWhom),
      weight: dto.weight ?? null,
      priceMinor: dto.priceMinor,
      currency: dto.currency,
      flavor: dto.flavor,
      allergens: dto.allergens,
      images: dto.images,
      videos: dto.videos,
      isTriedByUs: dto.isTriedByUs,
      quantity: dto.quantity,
      available: dto.available,
      sortWeight: dto.sortWeight,
      brand,
      brandId: brand?.id ?? null,
      country,
      countryId: country.id,
      category,
      categoryId: category.id,
    });

    const saved = await this.productsRepository.save(product);
    return this.toAdminProductDto(await this.getProductOrThrow(saved.id));
  }

  async update(id: string, dto: UpdateProductDto): Promise<AdminProductDto> {
    const product = await this.getProductOrThrow(id);

    if (dto.slug !== undefined) {
      product.slug = dto.slug;
    }
    if (dto.name !== undefined) {
      product.nameLocale = new LocalizedString(dto.name);
    }
    if (dto.description !== undefined) {
      product.descriptionLocale = new LocalizedString(dto.description);
    }
    if (dto.story !== undefined) {
      product.storyLocale = new LocalizedString(dto.story);
    }
    if (dto.forWhom !== undefined) {
      product.forWhomLocale = new LocalizedString(dto.forWhom);
    }
    if (dto.weight !== undefined) {
      product.weight = dto.weight;
    }
    if (dto.priceMinor !== undefined) {
      product.priceMinor = dto.priceMinor;
    }
    if (dto.currency !== undefined) {
      product.currency = dto.currency;
    }
    if (dto.flavor !== undefined) {
      product.flavor = dto.flavor;
    }
    if (dto.allergens !== undefined) {
      product.allergens = dto.allergens;
    }
    if (dto.images !== undefined) {
      product.images = dto.images;
    }
    if (dto.videos !== undefined) {
      product.videos = dto.videos;
    }
    if (dto.isTriedByUs !== undefined) {
      product.isTriedByUs = dto.isTriedByUs;
    }
    if (dto.quantity !== undefined) {
      product.quantity = dto.quantity;
    }
    if (dto.available !== undefined) {
      product.available = dto.available;
    }
    if (dto.sortWeight !== undefined) {
      product.sortWeight = dto.sortWeight;
    }
    if (dto.brandId !== undefined) {
      product.brand = dto.brandId === null ? null : await this.getBrandOrThrow(dto.brandId);
    }
    if (dto.countryId !== undefined) {
      product.country = await this.getCountryOrThrow(dto.countryId);
    }
    if (dto.categoryId !== undefined) {
      product.category = await this.getCategoryOrThrow(dto.categoryId);
    }

    await this.productsRepository.save(product);
    return this.toAdminProductDto(await this.getProductOrThrow(id));
  }

  private buildWhere(filters: ListAdminProductsFilters): FindOptionsWhere<Product> {
    const where: FindOptionsWhere<Product> = {};

    const slug = filters.slug?.trim();
    if (slug) {
      where.slug = ILike(`${slug}%`);
    }

    const name = filters.name?.trim();
    if (name) {
      where.nameLocale = Raw((alias) => `${alias} ->> :locale ILIKE :pattern`, {
        locale: DEFAULT_LOCALE,
        pattern: `${name}%`,
      });
    }

    if (filters.categoryId?.length) {
      where.categoryId = In(filters.categoryId);
    }
    if (filters.brandId?.length) {
      where.brandId = In(filters.brandId);
    }
    if (filters.countryId?.length) {
      where.countryId = In(filters.countryId);
    }

    return where;
  }

  private async getProductOrThrow(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new AdminProductNotFoundException(id);
    }
    return product;
  }

  private async getBrandOrThrow(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) {
      throw new ProductBrandNotFoundException(id);
    }
    return brand;
  }

  private async getCategoryOrThrow(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new ProductCategoryNotFoundException(id);
    }
    return category;
  }

  private async getCountryOrThrow(id: string): Promise<Country> {
    const country = await this.countriesRepository.findOne({ where: { id } });
    if (!country) {
      throw new ProductCountryNotFoundException(id);
    }
    return country;
  }

  private toAdminProductDto(product: Product): AdminProductDto {
    return {
      id: product.id,
      slug: product.slug,
      name: product.nameLocale.toJSON(),
      description: product.descriptionLocale.toJSON(),
      story: product.storyLocale.toJSON(),
      forWhom: product.forWhomLocale.toJSON(),
      weight: product.weight,
      priceMinor: product.priceMinor,
      currency: product.currency,
      flavor: product.flavor,
      allergens: product.allergens,
      images: product.images,
      videos: product.videos,
      isTriedByUs: product.isTriedByUs,
      quantity: product.quantity,
      available: product.available,
      sortWeight: product.sortWeight,
      brand: product.brand
        ? { id: product.brand.id, slug: product.brand.slug, name: product.brand.name }
        : null,
      country: {
        id: product.country.id,
        slug: product.country.slug,
        name: product.country.nameLocale.toJSON(),
      },
      category: {
        id: product.category.id,
        slug: product.category.slug,
        name: product.category.nameLocale.toJSON(),
      },
    };
  }
}
