import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, Req, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import { Product } from '../products/product.entity';
import { readVisitorSessionId, VisitorSessionService, writeVisitorSessionCookie } from '../visitor';
import type { VisitorSession } from '../visitor/visitor-session.entity';
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedNextResponseDto> {
    const visitor = await this.resolveVisitorForFeed(req, res, { reshuffle: dto.reshuffle });

    return this.feedService.next(visitor, dto.reshuffle ? { filters: dto.filters } : dto);
  }

  @Post('products/:productId/like')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async like(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedLikeStateDto> {
    const visitor = await this.resolveVisitorForFeed(req, res);
    await this.sessionService.like(visitor.id, productId);
    return { liked: true };
  }

  @Delete('products/:productId/like')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async unlike(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedLikeStateDto> {
    const visitor = await this.resolveVisitorForFeed(req, res);
    await this.sessionService.unlike(visitor.id, productId);
    return { liked: false };
  }

  @Get('products/:productId/comments')
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  comments(@Param('productId', ParseUUIDPipe) productId: string): Promise<FeedProductComment[]> {
    return this.commentsService.listForProduct(productId);
  }

  @Get('likes')
  async likes(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<Product[]> {
    const visitor = await this.resolveVisitorForFeed(req, res);
    return this.feedService.getLikedItems(visitor);
  }

  private async resolveVisitorForFeed(
    req: Request,
    res: Response,
    options?: { reshuffle?: boolean },
  ): Promise<VisitorSession> {
    let visitor = await this.visitorService.resolve(readVisitorSessionId(req));

    if (options?.reshuffle) {
      await this.visitorService.resetFeedViews(visitor.id);
    }

    visitor = await this.visitorService.resolveForFeed(visitor);
    writeVisitorSessionCookie(res, visitor.id);
    return visitor;
  }
}
