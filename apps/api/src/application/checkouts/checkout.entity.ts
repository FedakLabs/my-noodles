import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { Order } from '../orders/order.entity';
import { VisitorSession } from '../visitor/visitor-session.entity';
import { CheckoutCancelledReason } from './checkout-cancelled-reason';
import { CheckoutStatus } from './checkout-status';

@Entity({ name: 'checkouts' })
export class Checkout extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'order_id', type: 'uuid', unique: true })
  orderId!: string;

  @OneToOne(() => Order, (order) => order.checkout, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'visitor_session_id', type: 'uuid' })
  visitorSessionId!: string;

  @ManyToOne(() => VisitorSession, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'visitor_session_id' })
  visitorSession!: VisitorSession;

  @Column({ type: 'text' })
  status!: CheckoutStatus;

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason!: CheckoutCancelledReason | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}
