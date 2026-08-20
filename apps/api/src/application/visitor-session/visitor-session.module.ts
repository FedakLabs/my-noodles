import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartItem } from '../cart/cart-item.entity';
import { FeedSessionView } from '../feed/feed-session-view.entity';
import { DataRetentionController } from './data-retention.controller';
import { DataRetentionService } from './data-retention.service';
import { VisitorSession } from './visitor-session.entity';
import { RequireVisitorSessionMiddleware, VisitorSessionMiddleware } from './visitor-session.middleware';
import { VisitorSessionService } from './visitor-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([VisitorSession, FeedSessionView, CartItem])],
  controllers: [DataRetentionController],
  providers: [
    DataRetentionService,
    VisitorSessionService,
    VisitorSessionMiddleware,
    RequireVisitorSessionMiddleware,
  ],
  exports: [VisitorSessionService, VisitorSessionMiddleware, RequireVisitorSessionMiddleware],
})
export class VisitorSessionModule {}
