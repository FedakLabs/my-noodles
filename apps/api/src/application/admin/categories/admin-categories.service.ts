import { jsonbAnyLocaleIlike, LocalizedString } from '@my-noodles/api-lib/locale';
import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, type Repository } from 'typeorm';

import { Category } from '../../categories/category.entity';
import type { CreateCategoryDto, UpdateCategoryDto } from './admin-categories.dto';
import { CategoryNotFoundException } from './admin-categories.exceptions';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async list(query: { page: number; limit: number; q?: string }): Promise<PaginatedResult<Category>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Category> | FindOptionsWhere<Category>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { nameLocale: jsonbAnyLocaleIlike(pattern) }];
    }

    return await PaginationHelper.paginate(
      this.categoriesRepository,
      { page: query.page, limit: query.limit },
      { where, order: { sortOrder: 'ASC', slug: 'ASC' } },
    );
  }

  async getById(id: string): Promise<Category> {
    return await this.getCategoryOrThrow(id);
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      slug: dto.slug,
      nameLocale: new LocalizedString(dto.nameLocale),
      icon: dto.icon ?? null,
      sortOrder: dto.sortOrder,
      themeKey: dto.themeKey ?? null,
    });

    return await this.categoriesRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.getCategoryOrThrow(id);

    if (dto.slug !== undefined) {
      category.slug = dto.slug;
    }
    if (dto.nameLocale !== undefined) {
      category.nameLocale = new LocalizedString(dto.nameLocale);
    }
    if (dto.icon !== undefined) {
      category.icon = dto.icon;
    }
    if (dto.sortOrder !== undefined) {
      category.sortOrder = dto.sortOrder;
    }
    if (dto.themeKey !== undefined) {
      category.themeKey = dto.themeKey;
    }

    return await this.categoriesRepository.save(category);
  }

  private async getCategoryOrThrow(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return category;
  }
}
