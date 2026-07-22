import { Injectable } from '@nestjs/common';

import type { DeliveryMethod } from '../../orders/order-delivery.dto';
import type { DeliveryEstimate, DeliveryEstimateInput } from '../delivery.types';

/**
 * Per-method stub estimate knobs. Edit inside each concrete adapter when tariffs/SLA change.
 *
 * Shown ETA = transit + under-promise buffer (under-promise, over-deliver).
 */
export type StubEstimateMethodConfig = {
  /** Provider-typical transit before under-promise buffer. */
  transitDaysMin: number;
  transitDaysMax: number;
  /** Flat shipping in UAH kopiyky, or null when carrier tariff is unknown. */
  shippingCostMinor: number | null;
};

/** Orders at or after this local hour dispatch the next calendar day. */
const DISPATCH_CUTOFF_HOUR = 14;

/** Extra calendar days added on top of provider transit. */
const UNDER_PROMISE_DAYS = { min: 1, max: 2 } as const;

/**
 * Shared stub estimate algorithm. Adapters inject this and pass their own method pricing table.
 */
@Injectable()
export class StubDeliveryEstimate {
  estimate(
    input: DeliveryEstimateInput,
    byMethod: Record<DeliveryMethod, StubEstimateMethodConfig>,
  ): Promise<DeliveryEstimate> {
    const row = byMethod[input.method];
    const estimatedDaysMin = row.transitDaysMin + UNDER_PROMISE_DAYS.min;
    const estimatedDaysMax = row.transitDaysMax + UNDER_PROMISE_DAYS.max;

    const now = new Date();
    const dispatchDate = this.resolveDispatchDate(input.orderCreatedAt, now);
    const estimatedDeliveryAt = this.addCalendarDays(dispatchDate, estimatedDaysMin);

    return Promise.resolve({
      estimatedDeliveryAt: estimatedDeliveryAt.toISOString(),
      estimatedDaysMin,
      estimatedDaysMax,
      shippingCostMinor: row.shippingCostMinor,
    });
  }

  private resolveDispatchDate(orderCreatedAt: Date, now: Date): Date {
    const reference = now.getTime() > orderCreatedAt.getTime() ? now : orderCreatedAt;
    const dispatch = new Date(reference);
    dispatch.setHours(0, 0, 0, 0);

    if (reference.getHours() >= DISPATCH_CUTOFF_HOUR) {
      dispatch.setDate(dispatch.getDate() + 1);
    }

    return dispatch;
  }

  private addCalendarDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
