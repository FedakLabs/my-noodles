import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import { DeliveryMethod, DeliveryProvider } from './order-delivery.dto';
import type { Order } from './order.entity';

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

  @Column({ type: 'text', nullable: true })
  city!: string | null;

  @Column({ name: 'city_ref', type: 'text', nullable: true })
  cityRef!: string | null;

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

  @Column({ name: 'estimated_delivery_at', type: 'timestamptz', nullable: true })
  estimatedDeliveryAt!: Date | null;

  @Column({ name: 'estimated_days_min', type: 'int', nullable: true })
  estimatedDaysMin!: number | null;

  @Column({ name: 'estimated_days_max', type: 'int', nullable: true })
  estimatedDaysMax!: number | null;

  @Column({ name: 'shipping_cost_minor', type: 'int', nullable: true })
  shippingCostMinor!: number | null;
}
