import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import {
  buildProductOrder,
  buildProductWhere,
  DEFAULT_PRODUCT_SORT,
  productListRelations,
} from '../products/products.filters';
import type {
  FeedFiltersDto,
  FeedItemDto,
  FeedLikedItemDto,
  FeedNextDto,
  FeedNextResponseDto,
} from './feed.dto';
import type { FeedFilterSnapshot } from './feed.types';
import { FeedCommentsService } from './feed-comments.service';
import { FeedSession } from './feed-session.entity';
import { FeedSessionService } from './feed-session.service';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly sessionService: FeedSessionService,
    private readonly commentsService: FeedCommentsService,
  ) {}

  async next(session: FeedSession, dto: FeedNextDto): Promise<FeedNextResponseDto> {
    const filters: FeedFiltersDto = dto.filters ?? {};

    if (dto.previousProduct) {
      await this.sessionService.recordView(session.id, {
        productId: dto.previousProduct.id,
        dwellMs: dto.previousProduct.viewTime,
        filters: toFilterSnapshot(filters),
      });
    }

    const [viewedIds, likedProducts] = await Promise.all([
      this.sessionService.getViewedProductIds(session.id),
      this.sessionService.getLikedProducts(session.id),
    ]);

    const where = buildProductWhere(filters);
    if (viewedIds.length > 0) {
      where.id = Not(In(viewedIds));
    }

    const [next] = await this.productsRepository.find({
      where,
      relations: productListRelations,
      order: buildProductOrder(DEFAULT_PRODUCT_SORT),
      take: 1,
    });

    if (!next) {
      return { item: null, exhausted: true };
    }

    const likedIds = new Set(likedProducts.map((product) => product.id));
    const commentCount = await this.commentsService.countForProduct(next.id);

    return { item: this.toItem(next, likedIds.has(next.id), commentCount), exhausted: false };
  }

  async getLikedItems(session: FeedSession): Promise<FeedLikedItemDto[]> {
    const products = await this.sessionService.getLikedProducts(session.id);

    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name.localized,
      priceMinor: product.priceMinor,
      currency: product.currency,
      images: product.images,
    }));
  }

  private toItem(product: Product, liked: boolean, commentCount: number): FeedItemDto {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name.localized,
      priceMinor: product.priceMinor,
      currency: product.currency,
      images: product.images,
      videos: product.videos,
      inStock: product.quantity > 0,
      category: { slug: product.category.slug, name: product.category.name.localized },
      country: { slug: product.country.slug, name: product.country.name.localized },
      brand: product.brand ? { slug: product.brand.slug, name: product.brand.name } : null,
      commentCount,
      liked,
    };
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
