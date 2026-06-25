import { Column, Entity, OneToMany } from 'typeorm';

import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import { FeedSessionLike } from './feed-session-like.entity';
import { FeedSessionView } from './feed-session-view.entity';

@Entity({ name: 'feed_sessions' })
export class FeedSession extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @OneToMany(() => FeedSessionLike, (like) => like.session)
  likes!: FeedSessionLike[];

  @OneToMany(() => FeedSessionView, (view) => view.session)
  views!: FeedSessionView[];
}
