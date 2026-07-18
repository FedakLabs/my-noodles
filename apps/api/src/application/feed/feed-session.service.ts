import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import { FeedSessionLike } from './feed-session-like.entity';
import { FeedSessionView } from './feed-session-view.entity';
import { FeedProductNotFoundException } from './feed.exceptions';
import type { FeedFilterSnapshot } from './feed.types';

type RecordViewInput = {
  productId: string;
  dwellMs: number;
  filters: FeedFilterSnapshot | null;
};

@Injectable()
export class FeedSessionService {
  constructor(
    @InjectRepository(FeedSessionLike)
    private readonly likesRepository: Repository<FeedSessionLike>,
    @InjectRepository(FeedSessionView)
    private readonly viewsRepository: Repository<FeedSessionView>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async recordView(visitorSessionId: string, input: RecordViewInput): Promise<void> {
    if (!(await this.productExists(input.productId))) {
      return;
    }

    const existing = await this.viewsRepository.findOne({
      where: { visitorSessionId, productId: input.productId },
    });

    if (existing) {
      existing.dwellMs += input.dwellMs;
      existing.filters = input.filters;
      await this.viewsRepository.save(existing);
      return;
    }

    await this.viewsRepository.save(
      this.viewsRepository.create({
        visitorSessionId,
        productId: input.productId,
        dwellMs: input.dwellMs,
        filters: input.filters,
      }),
    );
  }

  async like(visitorSessionId: string, productId: string): Promise<void> {
    if (!(await this.productExists(productId))) {
      throw new FeedProductNotFoundException(productId);
    }

    const existing = await this.likesRepository.findOne({
      where: { visitorSessionId, productId },
      withDeleted: true,
    });

    if (!existing) {
      await this.likesRepository.save(this.likesRepository.create({ visitorSessionId, productId }));
      return;
    }

    if (existing.deletedAt) {
      existing.deletedAt = null;
      await this.likesRepository.save(existing);
    }
  }

  async unlike(visitorSessionId: string, productId: string): Promise<void> {
    await this.likesRepository.softDelete({
      visitorSessionId,
      productId,
    });
  }

  async getLikedProducts(visitorSessionId: string): Promise<Product[]> {
    const likes = await this.likesRepository.find({
      where: { visitorSessionId },
      order: { createdAt: 'DESC' },
    });

    return likes.map((like) => like.product);
  }

  async getViewedProductIds(visitorSessionId: string): Promise<string[]> {
    const views = await this.viewsRepository.find({
      where: { visitorSessionId },
      select: { productId: true },
    });

    return [...new Set(views.map((view) => view.productId))];
  }

  private async productExists(productId: string): Promise<boolean> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      select: { id: true },
    });

    return product !== null;
  }
}
