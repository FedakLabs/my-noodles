import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { TimestampEntity, UuidV7PrimaryColumn } from '@/infrastructure/persistence';

import { Checkout } from '../checkouts/checkout.entity';
import { VisitorSession } from '../visitor/visitor-session.entity';
import { OrderCancelledReason } from './order-cancelled-reason';
import { OrderDelivery } from './order-delivery.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status';

@Entity({ name: 'orders' })
export class Order extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'visitor_session_id', type: 'uuid', nullable: true })
  visitorSessionId!: string | null;

  @ManyToOne(() => VisitorSession, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'visitor_session_id' })
  visitorSession!: VisitorSession | null;

  @Column({ name: 'first_name', type: 'text', nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName!: string | null;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @Column({ name: 'total_minor', type: 'int' })
  totalMinor!: number;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ type: 'text' })
  status!: OrderStatus;

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason!: OrderCancelledReason | null;

  @OneToOne(() => OrderDelivery, (delivery) => delivery.order, { cascade: true, nullable: true })
  delivery!: OrderDelivery | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @OneToOne(() => Checkout, (checkout) => checkout.order, { nullable: true })
  checkout!: Checkout | null;
}
