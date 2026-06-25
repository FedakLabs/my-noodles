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

/** Cap candidates scored in memory — the catalog is small, so a full scan is cheap and simple. */
const CANDIDATE_LIMIT = 200;
const LIKED_CATEGORY_WEIGHT = 80;
const LIKED_BRAND_WEIGHT = 40;
const LIKED_COUNTRY_WEIGHT = 30;
const DWELL_WEIGHT_CAP = 60;
const DWELL_MS_PER_POINT = 1000;
const RANDOM_JITTER = 15;

type Affinity = {
  likedCategories: Set<string>;
  likedBrands: Set<string>;
  likedCountries: Set<string>;
  categoryDwell: Map<string, number>;
};

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

    const [viewedIds, likedProducts, categoryDwell] = await Promise.all([
      this.sessionService.getViewedProductIds(session.id),
      this.sessionService.getLikedProducts(session.id),
      this.sessionService.getCategoryDwell(session.id),
    ]);

    const where = buildProductWhere(filters);
    if (viewedIds.length > 0) {
      where.id = Not(In(viewedIds));
    }

    const candidates = await this.productsRepository.find({
      where,
      relations: productListRelations,
      order: buildProductOrder(DEFAULT_PRODUCT_SORT),
      take: CANDIDATE_LIMIT,
    });

    if (candidates.length === 0) {
      return { item: null, exhausted: true };
    }

    const likedIds = new Set(likedProducts.map((product) => product.id));
    const affinity: Affinity = {
      likedCategories: new Set(likedProducts.map((product) => product.category.slug)),
      likedBrands: new Set(
        likedProducts
          .map((product) => product.brand?.slug)
          .filter((slug): slug is string => typeof slug === 'string'),
      ),
      likedCountries: new Set(likedProducts.map((product) => product.country.slug)),
      categoryDwell,
    };

    const best = this.pickBest(candidates, affinity);
    const commentCount = await this.commentsService.countForProduct(best.id);

    return { item: this.toItem(best, likedIds.has(best.id), commentCount), exhausted: false };
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

  private pickBest(candidates: Product[], affinity: Affinity): Product {
    let best = candidates[0]!;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of candidates) {
      const score = this.score(candidate, affinity);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  }

  private score(product: Product, affinity: Affinity): number {
    let score = product.sortWeight;

    if (affinity.likedCategories.has(product.category.slug)) {
      score += LIKED_CATEGORY_WEIGHT;
    }
    if (product.brand && affinity.likedBrands.has(product.brand.slug)) {
      score += LIKED_BRAND_WEIGHT;
    }
    if (affinity.likedCountries.has(product.country.slug)) {
      score += LIKED_COUNTRY_WEIGHT;
    }

    const dwell = affinity.categoryDwell.get(product.category.slug) ?? 0;
    score += Math.min(dwell / DWELL_MS_PER_POINT, DWELL_WEIGHT_CAP);
    score += Math.random() * RANDOM_JITTER;

    return score;
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
