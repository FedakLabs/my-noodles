import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/product.entity';
import { VisitorModule } from '../visitor';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedCommentsService } from './feed-comments.service';
import { FeedProductComment } from './feed-product-comment.entity';
import { FeedSessionService } from './feed-session.service';
import { FeedSessionLike } from './feed-session-like.entity';
import { FeedSessionView } from './feed-session-view.entity';

@Module({
  imports: [
    VisitorModule,
    TypeOrmModule.forFeature([FeedSessionLike, FeedSessionView, FeedProductComment, Product]),
  ],
  controllers: [FeedController],
  providers: [FeedService, FeedSessionService, FeedCommentsService],
  exports: [FeedService, FeedSessionService, FeedCommentsService],
})
export class FeedModule {}
