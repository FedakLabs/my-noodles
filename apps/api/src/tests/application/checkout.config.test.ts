import { CheckoutStatus } from '@/application/checkouts/checkout-status';
import {
  CHECKOUT_HOLD_MS,
  checkoutExpiresAt,
  checkoutHoldMinCreatedAt,
  isCheckoutExpired,
} from '@/application/checkouts/checkout.config';
import { type Checkout } from '@/application/checkouts/checkout.entity';
import { inProgressCheckoutWhere } from '@/application/inventory/inventory.config';

import { describe, expect, it } from '../jest-globals';

describe('checkout.config', () => {
  const now = Date.parse('2025-06-20T10:00:00.000Z');

  it('marks in_progress checkouts older than hold window as expired', () => {
    const checkout = {
      status: CheckoutStatus.InProgress,
      createdAt: new Date(now - CHECKOUT_HOLD_MS - 1),
    } as Checkout;

    expect(isCheckoutExpired(checkout, now)).toBe(true);
  });

  it('keeps active checkouts inside the hold window', () => {
    const checkout = {
      status: CheckoutStatus.InProgress,
      createdAt: new Date(now - CHECKOUT_HOLD_MS + 60_000),
    } as Checkout;

    expect(isCheckoutExpired(checkout, now)).toBe(false);
  });

  it('computes expiresAt from createdAt + hold', () => {
    const createdAt = new Date(now);
    const checkout = { createdAt } as Checkout;

    expect(checkoutExpiresAt(checkout)).toBe(new Date(now + CHECKOUT_HOLD_MS).toISOString());
  });

  it('builds in-progress checkout filter without time window', () => {
    expect(inProgressCheckoutWhere()).toEqual({ status: CheckoutStatus.InProgress });
    expect(checkoutHoldMinCreatedAt(now)).toEqual(new Date(now - CHECKOUT_HOLD_MS));
  });
});
