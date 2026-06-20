import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Collection } from './collection.entity';
import type { CollectionDetailDto, CollectionSummaryDto } from './collections.dto';
import { CollectionNotFoundException } from './collections.exceptions';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
  ) {}

  async list(): Promise<CollectionSummaryDto[]> {
    const collections = await this.collectionsRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', slug: 'ASC' },
    });

    return collections.map((collection) => this.toSummary(collection));
  }

  async getBySlug(slug: string): Promise<CollectionDetailDto> {
    const collection = await this.collectionsRepository.findOne({
      where: { slug, isActive: true },
      relations: { products: true },
    });

    if (!collection) {
      throw new CollectionNotFoundException(slug);
    }

    return {
      ...this.toSummary(collection),
      productSlugs: (collection.products ?? []).map((product) => product.slug),
    };
  }

  private toSummary(collection: Collection): CollectionSummaryDto {
    return {
      code: collection.code,
      slug: collection.slug,
      name: collection.name.localized,
      description: collection.description.localized,
      heroImage: collection.heroImage,
      themeKey: collection.themeKey,
      sortOrder: collection.sortOrder,
    };
  }
}
