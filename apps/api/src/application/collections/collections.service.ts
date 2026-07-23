import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { isStorefrontListable } from '../products/product-storefront-visibility';
import { Collection } from './collection.entity';
import { CollectionNotFoundException } from './collections.exceptions';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
  ) {}

  async list(): Promise<Collection[]> {
    return await this.collectionsRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', slug: 'ASC' },
    });
  }

  async getBySlug(slug: string): Promise<Collection> {
    const collection = await this.collectionsRepository.findOne({
      where: { slug, isActive: true },
      relations: { products: true },
    });

    if (!collection) {
      throw new CollectionNotFoundException(slug);
    }

    collection.products = (collection.products ?? []).filter(isStorefrontListable);

    return collection;
  }
}
