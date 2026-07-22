import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { Checkout } from '../checkouts/checkout.entity';
import { VisitorSession } from '../visitor-session/visitor-session.entity';
import { OrderCancelledReason } from './order-cancelled-reason';
import { OrderDelivery } from './order-delivery.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity({ name: 'orders' })
export class Order extends TimestampEntity {
  @ApiProperty({ type: String, format: 'date-time' })
  declare createdAt: Date;

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

  /**
   * Products + shipping when a delivery estimate is present; otherwise equals `totalMinor`.
   * Response-only — set by `CheckoutCalculator.calculateTotals`.
   */
  @ApiPropertyOptional()
  grandTotalMinor?: number;

  /** Admin responses only — allowed next statuses for transition UI. */
  @ApiPropertyOptional({ enum: OrderStatus, isArray: true })
  availableTransitions?: OrderStatus[];

  @Column({ type: 'text' })
  currency!: string;

  @Column({ type: 'text' })
  status!: OrderStatus;

  @BeforeInsert()
  setDefaultStatus(): void {
    this.status = this.status || OrderStatus.Draft;
  }

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason!: OrderCancelledReason | null;

  @OneToOne(() => OrderDelivery, (delivery) => delivery.order, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  delivery!: OrderDelivery | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items!: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (entry) => entry.order)
  statusHistory!: OrderStatusHistory[];

  @OneToOne(() => Checkout, (checkout) => checkout.order, { nullable: true })
  checkout!: Checkout | null;
}
