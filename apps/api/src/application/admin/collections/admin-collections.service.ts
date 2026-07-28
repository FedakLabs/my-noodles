import { jsonbAnyLocaleIlike, LocalizedString } from '@my-noodles/api-lib/locale';
import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, type Repository } from 'typeorm';

import { Collection } from '../../collections/collection.entity';
import type { CreateCollectionDto, UpdateCollectionDto } from './admin-collections.dto';
import { CollectionNotFoundException } from './admin-collections.exceptions';

@Injectable()
export class AdminCollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
  ) {}

  async list(query: { page: number; limit: number; q?: string }): Promise<PaginatedResult<Collection>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Collection> | FindOptionsWhere<Collection>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { nameLocale: jsonbAnyLocaleIlike(pattern) }];
    }

    return await PaginationHelper.paginate(
      this.collectionsRepository,
      { page: query.page, limit: query.limit },
      { where, order: { sortOrder: 'ASC', slug: 'ASC' } },
    );
  }

  async getById(id: string): Promise<Collection> {
    return await this.getCollectionOrThrow(id);
  }

  async create(dto: CreateCollectionDto): Promise<Collection> {
    const collection = this.collectionsRepository.create({
      slug: dto.slug,
      nameLocale: new LocalizedString(dto.nameLocale),
      descriptionLocale: new LocalizedString(dto.descriptionLocale),
      longDescriptionLocale: new LocalizedString(dto.longDescriptionLocale),
      emoji: dto.emoji,
      color: dto.color,
      particles: dto.particles,
      heroImage: dto.heroImage ?? null,
      themeKey: dto.themeKey ?? null,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    }) as Collection;

    return await this.collectionsRepository.save(collection);
  }

  async update(id: string, dto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.getCollectionOrThrow(id);

    if (dto.slug !== undefined) {
      collection.slug = dto.slug;
    }
    if (dto.nameLocale !== undefined) {
      collection.nameLocale = new LocalizedString(dto.nameLocale);
    }
    if (dto.descriptionLocale !== undefined) {
      collection.descriptionLocale = new LocalizedString(dto.descriptionLocale);
    }
    if (dto.longDescriptionLocale !== undefined) {
      collection.longDescriptionLocale = new LocalizedString(dto.longDescriptionLocale);
    }
    if (dto.emoji !== undefined) {
      collection.emoji = dto.emoji;
    }
    if (dto.color !== undefined) {
      collection.color = dto.color;
    }
    if (dto.particles !== undefined) {
      collection.particles = dto.particles;
    }
    if (dto.heroImage !== undefined) {
      collection.heroImage = dto.heroImage;
    }
    if (dto.themeKey !== undefined) {
      collection.themeKey = dto.themeKey;
    }
    if (dto.sortOrder !== undefined) {
      collection.sortOrder = dto.sortOrder;
    }
    if (dto.isActive !== undefined) {
      collection.isActive = dto.isActive;
    }

    return await this.collectionsRepository.save(collection);
  }

  private async getCollectionOrThrow(id: string): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({ where: { id } });
    if (!collection) {
      throw new CollectionNotFoundException(id);
    }
    return collection;
  }
}
