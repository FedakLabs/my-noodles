import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import { Product } from '../products/product.entity';
import { FeedSession } from './feed-session.entity';

@Entity({ name: 'feed_session_likes' })
export class FeedSessionLike extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @ManyToOne(() => FeedSession, (session) => session.likes, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'session_id' })
  session!: FeedSession;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
