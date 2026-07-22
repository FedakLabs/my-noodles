import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { OrderStatus } from './order-status';
import type { Order } from './order.entity';

/**
 * Append-only status transition row. Written by the `orders_status_history_trg`
 * Postgres trigger — application code does not insert these.
 */
@Entity({ name: 'order_status_history' })
export class OrderStatusHistory extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @ManyToOne('Order', (order: Order) => order.statusHistory, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'old_status', type: 'text' })
  oldStatus!: OrderStatus;

  @Column({ name: 'new_status', type: 'text' })
  newStatus!: OrderStatus;
}
