import { TimestampEntity, UuidV7PrimaryColumn } from '@my-noodles/api-lib/persistence';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { OrderDeliveryEstimateDto } from '../delivery/delivery.dto';
import { Order } from '../orders/order.entity';
import { VisitorSession } from '../visitor-session/visitor-session.entity';
import { CheckoutCancelledReason, CheckoutStatus } from './checkouts.validators';

/** Checkout hold — fixed from checkout creation (not sliding on PATCH/merge). */
export const CHECKOUT_HOLD_MS = 15 * 60_000;

@Entity({ name: 'checkouts' })
export class Checkout extends TimestampEntity {
  @UuidV7PrimaryColumn()
  id!: string;

  @Column({ name: 'order_id', type: 'uuid', unique: true })
  orderId!: string;

  @OneToOne(() => Order, (order) => order.checkout, {
    eager: true,
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

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @BeforeInsert()
  setDefaultExpiresAt(): void {
    this.expiresAt = this.expiresAt || new Date(Date.now() + CHECKOUT_HOLD_MS);
    this.status = this.status || CheckoutStatus.InProgress;
  }

  /**
   * Live delivery estimate for the current checkout draft.
   * Response-only — set by `CheckoutsService.attachCheckoutAggregates`.
   */
  @ApiPropertyOptional({ type: () => OrderDeliveryEstimateDto, nullable: true })
  deliveryEstimate?: OrderDeliveryEstimateDto | null;

  @Expose()
  @ApiProperty()
  get isExpired(): boolean {
    return (
      this.status === CheckoutStatus.Cancelled && this.cancelledReason === CheckoutCancelledReason.Expired
    );
  }

  @Expose()
  @ApiProperty()
  get isHoldElapsed(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }
}
