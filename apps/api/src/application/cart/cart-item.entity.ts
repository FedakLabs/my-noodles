import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import { Product } from '../products/product.entity';
import { VisitorSession } from '../visitor/visitor-session.entity';

@Entity({ name: 'cart_items' })
export class CartItem extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'visitor_session_id', type: 'uuid' })
  visitorSessionId!: string;

  @ManyToOne(() => VisitorSession, {
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

  @Column({ type: 'int' })
  qty!: number;
}
