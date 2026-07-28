import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from '../cart/cart-item.entity';
import { FeedSessionView } from '../feed/feed-session-view.entity';
import { CART_IDLE_MS, FEED_IDLE_MS } from './visitor-session.config';
import { VisitorSession } from './visitor-session.entity';
import { VisitorSessionNotFoundException } from './visitor-session.exceptions';

@Injectable()
export class VisitorSessionService {
  constructor(
    @InjectRepository(VisitorSession)
    private readonly visitorsRepository: Repository<VisitorSession>,
    @InjectRepository(FeedSessionView)
    private readonly viewsRepository: Repository<FeedSessionView>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
  ) {}

  async resolve(existingId?: string): Promise<VisitorSession> {
    if (existingId) {
      const existing = await this.visitorsRepository.findOne({ where: { id: existingId } });
      if (existing) {
        return existing;
      }
    }

    const now = Date.now();
    return await this.visitorsRepository.save(
      this.visitorsRepository.create({
        feedExpiresAt: new Date(now + FEED_IDLE_MS),
        cartExpiresAt: new Date(now + CART_IDLE_MS),
      }),
    );
  }

  /** Require an existing visitor; do not mint (support binds to cart-owned session). */
  async require(existingId?: string): Promise<VisitorSession> {
    if (!existingId) {
      throw new VisitorSessionNotFoundException();
    }

    const existing = await this.visitorsRepository.findOne({ where: { id: existingId } });
    if (!existing) {
      throw new VisitorSessionNotFoundException();
    }

    return existing;
  }

  /** Slide feed TTL; on lapse reset views only (likes persist). */
  async resolveForFeed(visitor: VisitorSession): Promise<VisitorSession> {
    const now = Date.now();

    if (visitor.feedExpiresAt.getTime() <= now) {
      await this.resetFeedViews(visitor.id);
    }

    visitor.feedExpiresAt = new Date(now + FEED_IDLE_MS);
    return await this.visitorsRepository.save(visitor);
  }

  /** Slide cart TTL; on lapse clear cart items lazily. Checkouts are independent. */
  async resolveForCart(visitor: VisitorSession): Promise<VisitorSession> {
    const now = Date.now();

    if (visitor.cartExpiresAt.getTime() <= now) {
      await this.cartItemsRepository.delete({ visitorSessionId: visitor.id });
    }

    visitor.cartExpiresAt = new Date(now + CART_IDLE_MS);
    return await this.visitorsRepository.save(visitor);
  }

  async resetFeedViews(visitorId: string): Promise<void> {
    await this.viewsRepository.delete({ visitorSessionId: visitorId });
  }
}
