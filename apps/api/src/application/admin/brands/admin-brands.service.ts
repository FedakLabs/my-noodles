import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, type Repository } from 'typeorm';

import { Brand } from '../../brands/brand.entity';
import type { CreateBrandDto, UpdateBrandDto } from './admin-brands.dto';
import { BrandNotFoundException } from './admin-brands.exceptions';

@Injectable()
export class AdminBrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
  ) {}

  async list(query: { page: number; limit: number; q?: string }): Promise<PaginatedResult<Brand>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Brand> | FindOptionsWhere<Brand>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { name: ILike(pattern) }];
    }

    return await PaginationHelper.paginate(
      this.brandsRepository,
      { page: query.page, limit: query.limit },
      { where, order: { slug: 'ASC' } },
    );
  }

  async getById(id: string): Promise<Brand> {
    return await this.getBrandOrThrow(id);
  }

  async create(dto: CreateBrandDto): Promise<Brand> {
    const brand = this.brandsRepository.create({
      slug: dto.slug,
      name: dto.name,
      logoUrl: dto.logoUrl ?? null,
      themeKey: dto.themeKey ?? null,
    });

    return await this.brandsRepository.save(brand);
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.getBrandOrThrow(id);

    if (dto.slug !== undefined) {
      brand.slug = dto.slug;
    }
    if (dto.name !== undefined) {
      brand.name = dto.name;
    }
    if (dto.logoUrl !== undefined) {
      brand.logoUrl = dto.logoUrl;
    }
    if (dto.themeKey !== undefined) {
      brand.themeKey = dto.themeKey;
    }

    return await this.brandsRepository.save(brand);
  }

  private async getBrandOrThrow(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) {
      throw new BrandNotFoundException(id);
    }
    return brand;
  }
}
