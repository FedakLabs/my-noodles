import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { Product } from '../products/product.entity';
import { CurrentVisitorSession, type VisitorSession, VisitorSessionService } from '../visitor-session';
import { FeedCommentsService } from './feed-comments.service';
import { FeedProductComment } from './feed-product-comment.entity';
import { FeedSessionService } from './feed-session.service';
import { FeedLikeStateDto, FeedNextDto, FeedNextResponseDto } from './feed.dto';
import { FeedService } from './feed.service';

@ApiTags('Feed')
@Controller('feed')
export class FeedController extends LocalizedStorefrontController {
  constructor(
    @Inject(FeedService) private readonly feedService: FeedService,
    @Inject(VisitorSessionService) private readonly visitorService: VisitorSessionService,
    @Inject(FeedSessionService) private readonly sessionService: FeedSessionService,
    @Inject(FeedCommentsService) private readonly commentsService: FeedCommentsService,
  ) {
    super();
  }

  @Post('next')
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  async next(
    @Body() dto: FeedNextDto,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<FeedNextResponseDto> {
    const resolved = await this.resolveVisitorForFeed(visitor, { reshuffle: dto.reshuffle });
    return await this.feedService.next(resolved, dto.reshuffle ? { filters: dto.filters } : dto);
  }

  @Post('products/:productId/like')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async like(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<FeedLikeStateDto> {
    const resolved = await this.resolveVisitorForFeed(visitor);
    await this.sessionService.like(resolved.id, productId);
    return { liked: true };
  }

  @Delete('products/:productId/like')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async unlike(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentVisitorSession() visitor: VisitorSession,
  ): Promise<FeedLikeStateDto> {
    const resolved = await this.resolveVisitorForFeed(visitor);
    await this.sessionService.unlike(resolved.id, productId);
    return { liked: false };
  }

  @Get('products/:productId/comments')
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  comments(@Param('productId', ParseUUIDPipe) productId: string): Promise<FeedProductComment[]> {
    return this.commentsService.listForProduct(productId);
  }

  @Get('likes')
  async likes(@CurrentVisitorSession() visitor: VisitorSession): Promise<Product[]> {
    return await this.feedService.getLikedItems(await this.resolveVisitorForFeed(visitor));
  }

  private async resolveVisitorForFeed(
    visitor: VisitorSession,
    options?: { reshuffle?: boolean },
  ): Promise<VisitorSession> {
    if (options?.reshuffle) {
      await this.visitorService.resetFeedViews(visitor.id);
    }

    return await this.visitorService.resolveForFeed(visitor);
  }
}
