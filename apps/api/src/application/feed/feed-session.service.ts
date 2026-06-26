import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import { FeedProductNotFoundException } from './feed.exceptions';
import type { FeedFilterSnapshot } from './feed.types';
import { FEED_SESSION_IDLE_MS } from './feed-session.cookie';
import { FeedSession } from './feed-session.entity';
import { FeedSessionLike } from './feed-session-like.entity';
import { FeedSessionView } from './feed-session-view.entity';

type RecordViewInput = {
  productId: string;
  dwellMs: number;
  filters: FeedFilterSnapshot | null;
};

@Injectable()
export class FeedSessionService {
  constructor(
    @InjectRepository(FeedSession)
    private readonly sessionsRepository: Repository<FeedSession>,
    @InjectRepository(FeedSessionLike)
    private readonly likesRepository: Repository<FeedSessionLike>,
    @InjectRepository(FeedSessionView)
    private readonly viewsRepository: Repository<FeedSessionView>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /** Sliding ~2h idle session: resume a live session (refreshing expiry) or start a fresh one. */
  async resolveOrCreateSession(existingSessionId?: string): Promise<FeedSession> {
    const now = Date.now();
    const expiresAt = new Date(now + FEED_SESSION_IDLE_MS);

    if (existingSessionId) {
      const existing = await this.sessionsRepository.findOne({ where: { id: existingSessionId } });
      if (existing && existing.expiresAt.getTime() > now) {
        existing.expiresAt = expiresAt;
        await this.sessionsRepository.save(existing);
        return existing;
      }
    }

    return this.createFreshSession(expiresAt);
  }

  /** Always mints a new session — used when the customer reshuffles. */
  async createFreshSession(expiresAt = new Date(Date.now() + FEED_SESSION_IDLE_MS)): Promise<FeedSession> {
    return this.sessionsRepository.save(this.sessionsRepository.create({ expiresAt }));
  }

  /** Records dwell for the just-left product — accumulates on repeat views in the same session. */
  async recordView(sessionId: string, input: RecordViewInput): Promise<void> {
    if (!(await this.productExists(input.productId))) {
      return;
    }

    const existing = await this.viewsRepository.findOne({
      where: { sessionId, productId: input.productId },
    });

    if (existing) {
      existing.dwellMs += input.dwellMs;
      existing.filters = input.filters;
      await this.viewsRepository.save(existing);
      return;
    }

    await this.viewsRepository.save(
      this.viewsRepository.create({
        sessionId,
        productId: input.productId,
        dwellMs: input.dwellMs,
        filters: input.filters,
      }),
    );
  }

  async like(sessionId: string, productId: string): Promise<void> {
    if (!(await this.productExists(productId))) {
      throw new FeedProductNotFoundException(productId);
    }

    const existing = await this.likesRepository.findOne({
      where: { sessionId, productId },
      withDeleted: true,
    });

    if (!existing) {
      await this.likesRepository.save(this.likesRepository.create({ sessionId, productId }));
      return;
    }

    if (existing.deletedAt) {
      existing.deletedAt = null;
      await this.likesRepository.save(existing);
    }
  }

  async unlike(sessionId: string, productId: string): Promise<void> {
    await this.likesRepository.softDelete({ sessionId, productId, deletedAt: IsNull() });
  }

  /** Active likes with product relations — powers personalization boosts and the liked list. */
  async getLikedProducts(sessionId: string): Promise<Product[]> {
    const likes = await this.likesRepository.find({
      where: { sessionId },
      relations: { product: { brand: true, country: true, category: true } },
      order: { createdAt: 'DESC' },
    });

    return likes.map((like) => like.product);
  }

  async getViewedProductIds(sessionId: string): Promise<string[]> {
    const views = await this.viewsRepository.find({
      where: { sessionId },
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
