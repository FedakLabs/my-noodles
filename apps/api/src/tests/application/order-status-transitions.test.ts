import { OrderStatus } from '@/application/orders/order-status';
import {
  availableOrderTransitions,
  isOrderTransitionAllowed,
} from '@/application/orders/order-status-transitions';

import { describe, expect, it } from '../jest-globals';

describe('order-status-transitions', () => {
  it('allows new → confirmed and new → cancelled', () => {
    expect(availableOrderTransitions(OrderStatus.New)).toEqual([
      OrderStatus.Confirmed,
      OrderStatus.Cancelled,
    ]);
    expect(isOrderTransitionAllowed(OrderStatus.New, OrderStatus.Confirmed)).toBe(true);
    expect(isOrderTransitionAllowed(OrderStatus.New, OrderStatus.Completed)).toBe(false);
  });

  it('allows completed → returned and archived', () => {
    expect(availableOrderTransitions(OrderStatus.Completed)).toEqual([
      OrderStatus.Returned,
      OrderStatus.Archived,
    ]);
  });
});
