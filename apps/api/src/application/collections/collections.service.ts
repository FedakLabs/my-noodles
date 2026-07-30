import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { isStorefrontListable } from '../products/product-storefront-visibility';
import { Collection } from './collection.entity';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
  ) {}

  async list(query: { page: number; limit: number }): Promise<PaginatedResult<Collection>> {
    const result = await PaginationHelper.paginate(
      this.collectionsRepository,
      { page: query.page, limit: query.limit },
      {
        where: { isActive: true },
        order: { sortOrder: 'ASC', slug: 'ASC' },
      },
    );

    if (result.items.length === 0) {
      return result;
    }

    const withProducts = await this.collectionsRepository.find({
      where: { id: In(result.items.map((collection) => collection.id)) },
      relations: { products: true },
      order: { sortOrder: 'ASC', slug: 'ASC' },
    });

    const productsById = new Map(withProducts.map((collection) => [collection.id, collection.products]));

    for (const collection of result.items) {
      collection.products = (productsById.get(collection.id) ?? []).filter(isStorefrontListable);
    }

    return result;
  }
}
