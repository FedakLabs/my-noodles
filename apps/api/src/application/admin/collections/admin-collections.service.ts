import { jsonbAnyLocaleIlike, LocalizedString } from '@my-noodles/api-lib/locale';
import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, ILike, type Repository } from 'typeorm';

import { Collection } from '../../collections/collection.entity';
import type { AdminCollectionDto, CreateCollectionDto, UpdateCollectionDto } from './admin-collections.dto';
import { CollectionNotFoundException } from './admin-collections.exceptions';

@Injectable()
export class AdminCollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
  ) {}

  async list(query: {
    page: number;
    limit: number;
    q?: string;
  }): Promise<PaginatedResult<AdminCollectionDto>> {
    const term = query.q?.trim();
    let where: FindOptionsWhere<Collection> | FindOptionsWhere<Collection>[] = {};

    if (term) {
      const pattern = `%${term}%`;
      where = [{ slug: ILike(pattern) }, { nameLocale: jsonbAnyLocaleIlike(pattern) }];
    }

    const result = await PaginationHelper.paginate(
      this.collectionsRepository,
      { page: query.page, limit: query.limit },
      { where, order: { sortOrder: 'ASC', slug: 'ASC' } },
    );

    return {
      items: result.items.map((c) => this.toAdminCollectionDto(c)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<AdminCollectionDto> {
    return this.toAdminCollectionDto(await this.getCollectionOrThrow(id));
  }

  async create(dto: CreateCollectionDto): Promise<AdminCollectionDto> {
    const collection = this.collectionsRepository.create({
      slug: dto.slug,
      nameLocale: new LocalizedString(dto.name),
      descriptionLocale: new LocalizedString(dto.description),
      longDescriptionLocale: new LocalizedString(dto.longDescription),
      emoji: dto.emoji,
      color: dto.color,
      particles: dto.particles,
      heroImage: dto.heroImage ?? null,
      themeKey: dto.themeKey ?? null,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    }) as Collection;

    const saved = await this.collectionsRepository.save(collection);
    return this.toAdminCollectionDto(saved);
  }

  async update(id: string, dto: UpdateCollectionDto): Promise<AdminCollectionDto> {
    const collection = await this.getCollectionOrThrow(id);

    if (dto.slug !== undefined) {
      collection.slug = dto.slug;
    }
    if (dto.name !== undefined) {
      collection.nameLocale = new LocalizedString(dto.name);
    }
    if (dto.description !== undefined) {
      collection.descriptionLocale = new LocalizedString(dto.description);
    }
    if (dto.longDescription !== undefined) {
      collection.longDescriptionLocale = new LocalizedString(dto.longDescription);
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

    const saved = await this.collectionsRepository.save(collection);
    return this.toAdminCollectionDto(saved);
  }

  private async getCollectionOrThrow(id: string): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({ where: { id } });
    if (!collection) {
      throw new CollectionNotFoundException(id);
    }
    return collection;
  }

  private toAdminCollectionDto(collection: Collection): AdminCollectionDto {
    return {
      id: collection.id,
      slug: collection.slug,
      name: collection.nameLocale.toJSON(),
      description: collection.descriptionLocale.toJSON(),
      longDescription: collection.longDescriptionLocale.toJSON(),
      emoji: collection.emoji,
      color: collection.color,
      particles: collection.particles,
      heroImage: collection.heroImage,
      themeKey: collection.themeKey,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
    };
  }
}
