import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartItem } from '../cart/cart-item.entity';
import { FeedSessionView } from '../feed/feed-session-view.entity';
import { VisitorSession } from './visitor-session.entity';
import { VisitorSessionMiddleware } from './visitor-session.middleware';
import { VisitorSessionService } from './visitor-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([VisitorSession, FeedSessionView, CartItem])],
  providers: [VisitorSessionService, VisitorSessionMiddleware],
  exports: [VisitorSessionService, VisitorSessionMiddleware],
})
export class VisitorSessionModule {}
