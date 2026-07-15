import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, OneToMany } from 'typeorm';

import { FeedSessionLike } from '../feed/feed-session-like.entity';
import { FeedSessionView } from '../feed/feed-session-view.entity';

@Entity({ name: 'visitor_sessions' })
export class VisitorSession extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'feed_expires_at', type: 'timestamptz' })
  feedExpiresAt!: Date;

  @Column({ name: 'cart_expires_at', type: 'timestamptz' })
  cartExpiresAt!: Date;

  @OneToMany(() => FeedSessionLike, (like) => like.visitorSession)
  likes!: FeedSessionLike[];

  @OneToMany(() => FeedSessionView, (view) => view.visitorSession)
  views!: FeedSessionView[];
}
