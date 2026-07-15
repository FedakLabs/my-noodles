import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Product } from '../products/product.entity';
import type { Order } from './order.entity';

@Entity({ name: 'order_items' })
export class OrderItem extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne('Order', (order: Order) => order.items, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'title_snapshot', type: 'text' })
  titleSnapshot!: string;

  @Column({ name: 'price_minor_snapshot', type: 'int' })
  priceMinorSnapshot!: number;

  @Column({ type: 'int' })
  qty!: number;
}
