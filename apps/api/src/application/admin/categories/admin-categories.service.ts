import { LocalizedString } from '@my-noodles/api-lib/locale';
import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, Raw, type Repository } from 'typeorm';

import { Category } from '../../categories/category.entity';
import type { AdminCategoryDto, CreateCategoryDto, UpdateCategoryDto } from './admin-categories.dto';
import { CategoryNotFoundException } from './admin-categories.exceptions';

@Injectable()
export class AdminCategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async list(query: { page: number; limit: number; q?: string }): Promise<PaginatedResult<AdminCategoryDto>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Category> | FindOptionsWhere<Category>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { nameLocale: nameLocaleRaw(pattern) }];
    }

    const result = await PaginationHelper.paginate(
      this.categoriesRepository,
      { page: query.page, limit: query.limit },
      { where, order: { sortOrder: 'ASC', slug: 'ASC' } },
    );

    return {
      items: result.items.map((category) => this.toAdminCategoryDto(category)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<AdminCategoryDto> {
    return this.toAdminCategoryDto(await this.getCategoryOrThrow(id));
  }

  async create(dto: CreateCategoryDto): Promise<AdminCategoryDto> {
    const category = this.categoriesRepository.create({
      slug: dto.slug,
      nameLocale: new LocalizedString(dto.name),
      icon: dto.icon ?? null,
      sortOrder: dto.sortOrder,
      themeKey: dto.themeKey ?? null,
    });

    const saved = await this.categoriesRepository.save(category);
    return this.toAdminCategoryDto(saved);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<AdminCategoryDto> {
    const category = await this.getCategoryOrThrow(id);

    if (dto.slug !== undefined) {
      category.slug = dto.slug;
    }
    if (dto.name !== undefined) {
      category.nameLocale = new LocalizedString(dto.name);
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

    const saved = await this.categoriesRepository.save(category);
    return this.toAdminCategoryDto(saved);
  }

  private async getCategoryOrThrow(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return category;
  }

  private toAdminCategoryDto(category: Category): AdminCategoryDto {
    return {
      id: category.id,
      slug: category.slug,
      name: category.nameLocale.toJSON(),
      icon: category.icon,
      sortOrder: category.sortOrder,
      themeKey: category.themeKey,
    };
  }
}

/** Matches the `name` JSONB column (property `nameLocale`) against either supported locale. */
function nameLocaleRaw(pattern: string) {
  return Raw((alias) => `(${alias}->>'uk' ILIKE :pattern OR ${alias}->>'en' ILIKE :pattern)`, { pattern });
}
