import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Product } from '../products/product.entity';
import { VisitorSession } from '../visitor/visitor-session.entity';

@Entity({ name: 'feed_session_likes' })
export class FeedSessionLike extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'visitor_session_id', type: 'uuid' })
  visitorSessionId!: string;

  @ManyToOne(() => VisitorSession, (session) => session.likes, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'visitor_session_id' })
  visitorSession!: VisitorSession;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
