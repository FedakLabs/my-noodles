import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, Req, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { LocalizedStorefrontController } from '@/utils/localized-storefront.controller';

import {
  FeedCommentDto,
  FeedLikedItemDto,
  FeedLikeStateDto,
  FeedNextDto,
  FeedNextResponseDto,
} from './feed.dto';
import { FeedService } from './feed.service';
import { FeedCommentsService } from './feed-comments.service';
import { readFeedSessionId, writeFeedSessionCookie } from './feed-session.cookie';
import type { FeedSession } from './feed-session.entity';
import { FeedSessionService } from './feed-session.service';

@ApiTags('Feed')
@Controller('feed')
export class FeedController extends LocalizedStorefrontController {
  constructor(
    @Inject(FeedService) private readonly feedService: FeedService,
    @Inject(FeedSessionService) private readonly sessionService: FeedSessionService,
    @Inject(FeedCommentsService) private readonly commentsService: FeedCommentsService,
  ) {
    super();
  }

  @Post('next')
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Record the previous product view and return the next personalized item' })
  async next(
    @Body() dto: FeedNextDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedNextResponseDto> {
    const session = await this.resolveSession(req, res, { reshuffle: dto.reshuffle });

    return this.feedService.next(session, dto.reshuffle ? { filters: dto.filters } : dto);
  }

  @Post('products/:productId/like')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Like a product in the current feed session' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async like(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedLikeStateDto> {
    const session = await this.resolveSession(req, res);
    await this.sessionService.like(session.id, productId);
    return { liked: true };
  }

  @Delete('products/:productId/like')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Remove a like in the current feed session' })
  async unlike(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedLikeStateDto> {
    const session = await this.resolveSession(req, res);
    await this.sessionService.unlike(session.id, productId);
    return { liked: false };
  }

  @Get('products/:productId/comments')
  @Throttle({ default: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'List taste-impression comments for a product' })
  comments(@Param('productId', ParseUUIDPipe) productId: string): Promise<FeedCommentDto[]> {
    return this.commentsService.listForProduct(productId);
  }

  @Get('likes')
  @ApiOperation({ summary: 'List products liked in the current feed session' })
  async likes(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<FeedLikedItemDto[]> {
    const session = await this.resolveSession(req, res);
    return this.feedService.getLikedItems(session);
  }

  private async resolveSession(
    req: Request,
    res: Response,
    options?: { reshuffle?: boolean },
  ): Promise<FeedSession> {
    const session = options?.reshuffle
      ? await this.sessionService.createFreshSession()
      : await this.sessionService.resolveOrCreateSession(readFeedSessionId(req));
    writeFeedSessionCookie(res, session.id);
    return session;
  }
}
