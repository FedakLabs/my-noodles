import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import type { Order } from './order.entity';
import { DeliveryMethod, DeliveryProvider } from './order-delivery.dto';

@Entity({ name: 'order_deliveries' })
export class OrderDelivery extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'order_id', type: 'uuid', unique: true })
  orderId!: string;

  @OneToOne('Order', (order: Order) => order.delivery, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ type: 'text' })
  provider!: DeliveryProvider;

  @Column({ type: 'text' })
  method!: DeliveryMethod;

  @Column({ type: 'text' })
  city!: string;

  @Column({ name: 'warehouse_number', type: 'text', nullable: true })
  warehouseNumber!: string | null;

  @Column({ name: 'warehouse_name', type: 'text', nullable: true })
  warehouseName!: string | null;

  @Column({ name: 'warehouse_ref', type: 'text', nullable: true })
  warehouseRef!: string | null;

  @Column({ type: 'text', nullable: true })
  street!: string | null;

  @Column({ type: 'text', nullable: true })
  building!: string | null;

  @Column({ type: 'text', nullable: true })
  apartment!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
