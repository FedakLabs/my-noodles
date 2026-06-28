import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import { Product } from '../products/product.entity';
import { VisitorSession } from '../visitor/visitor-session.entity';
import type { FeedFilterSnapshot } from './feed.types';

/**
 * Per-view engagement record. Doubles as the exclusion/dedup source for `POST /feed/next`
 * and as the analytics signal (dwell + active filter context at view time).
 */
@Entity({ name: 'feed_session_views' })
export class FeedSessionView extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'visitor_session_id', type: 'uuid' })
  visitorSessionId!: string;

  @ManyToOne(() => VisitorSession, (session) => session.views, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'visitor_session_id' })
  visitorSession!: VisitorSession;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'dwell_ms', type: 'int' })
  dwellMs!: number;

  @Column({ type: 'jsonb', nullable: true })
  filters!: FeedFilterSnapshot | null;
}
