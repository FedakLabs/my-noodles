import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TimestampEntity } from '@/infrastructure/persistence';

import { OrderDelivery } from './order-delivery.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status';

@Entity({ name: 'orders' })
export class Order extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_name', type: 'text' })
  customerName!: string;

  @Column({ type: 'text' })
  phone!: string;

  @Column({ name: 'total_minor', type: 'int' })
  totalMinor!: number;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ type: 'text' })
  status!: OrderStatus;

  @OneToOne(() => OrderDelivery, (delivery) => delivery.order, { cascade: true })
  delivery!: OrderDelivery;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];
}
