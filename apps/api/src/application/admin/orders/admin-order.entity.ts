import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { OrderStatus } from '@/application/orders/order-status';
import { availableOrderTransitions } from '@/application/orders/order-status-transitions';
import { Order } from '@/application/orders/order.entity';

/**
 * Admin projection of {@link Order}.
 *
 * TypeORM allows only one `@Entity` per table — `Order` owns `orders`.
 * Admin injects `Repository<AdminOrder>` via a token alias to that mapping.
 */
export class AdminOrder extends Order {
  /** Allowed next statuses for transition UI. */
  @Expose()
  @ApiProperty({ enum: OrderStatus, isArray: true, enumName: 'OrderStatus' })
  get availableTransitions(): OrderStatus[] {
    return availableOrderTransitions(this.status);
  }

  /**
   * Checkout submit time — first draft→new status history row.
   * Distinct from `createdAt` (draft insert).
   */
  @Expose()
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  get orderedAt(): Date | null {
    const placed = this.statusHistory
      ?.filter((entry) => entry.oldStatus === OrderStatus.Draft && entry.newStatus === OrderStatus.New)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    return placed?.createdAt ?? null;
  }
}
