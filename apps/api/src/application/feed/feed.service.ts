import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import { buildProductOrder, buildProductWhere, DEFAULT_PRODUCT_SORT } from '../products/products.filters';
import type { VisitorSession } from '../visitor-session/visitor-session.entity';
import { FeedCommentsService } from './feed-comments.service';
import { FeedSessionService } from './feed-session.service';
import type { FeedFiltersDto, FeedNextDto, FeedNextResponseDto } from './feed.dto';
import type { FeedFilterSnapshot } from './feed.types';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly sessionService: FeedSessionService,
    private readonly commentsService: FeedCommentsService,
  ) {}

  async next(visitor: VisitorSession, dto: FeedNextDto): Promise<FeedNextResponseDto> {
    const filters: FeedFiltersDto = dto.filters ?? {};

    if (dto.previousProduct) {
      await this.sessionService.recordView(visitor.id, {
        productId: dto.previousProduct.id,
        dwellMs: dto.previousProduct.viewTime,
        filters: toFilterSnapshot(filters),
      });
    }

    const [viewedIds, likedProducts] = await Promise.all([
      this.sessionService.getViewedProductIds(visitor.id),
      this.sessionService.getLikedProducts(visitor.id),
    ]);

    const where = buildProductWhere(filters);
    if (viewedIds.length > 0) {
      where.id = Not(In(viewedIds));
    }

    const [next] = await this.productsRepository.find({
      where,
      order: buildProductOrder(DEFAULT_PRODUCT_SORT),
      take: 1,
    });

    if (!next) {
      return { item: null, exhausted: true };
    }

    const likedIds = new Set(likedProducts.map((product) => product.id));
    const commentCount = await this.commentsService.countForProduct(next.id);
    next.liked = likedIds.has(next.id);
    next.commentCount = commentCount;

    return { item: next, exhausted: false };
  }

  async getLikedItems(visitor: VisitorSession): Promise<Product[]> {
    const products = await this.sessionService.getLikedProducts(visitor.id);
    for (const product of products) {
      product.liked = true;
    }
    return products;
  }
}

function toFilterSnapshot(filters: FeedFiltersDto): FeedFilterSnapshot | null {
  const snapshot: FeedFilterSnapshot = {};

  if (filters.category?.length) {
    snapshot.category = filters.category;
  }
  if (filters.country?.length) {
    snapshot.country = filters.country;
  }
  if (filters.brand?.length) {
    snapshot.brand = filters.brand;
  }

  return Object.keys(snapshot).length > 0 ? snapshot : null;
}
