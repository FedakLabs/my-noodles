import { CheckoutStatus } from '@/application/checkouts/checkout-status';
import { CHECKOUT_HOLD_MS, Checkout } from '@/application/checkouts/checkout.entity';

import { describe, expect, it } from '../jest-globals';

function checkout(partial: Partial<Checkout>): Checkout {
  return Object.assign(new Checkout(), partial);
}

describe('Checkout entity', () => {
  it('marks in_progress checkouts past expiresAt as expired', () => {
    const entity = checkout({
      status: CheckoutStatus.InProgress,
      expiresAt: new Date(Date.now() - 1),
    });

    expect(entity.isExpired).toBe(true);
  });

  it('keeps active checkouts before expiresAt', () => {
    const entity = checkout({
      status: CheckoutStatus.InProgress,
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(entity.isExpired).toBe(false);
  });

  it('exposes expiresAtIso while in progress', () => {
    const expiresAt = new Date(Date.now() + CHECKOUT_HOLD_MS);
    const entity = checkout({
      status: CheckoutStatus.InProgress,
      expiresAt,
    });

    expect(entity.expiresAtIso).toBe(expiresAt.toISOString());
  });

  it('returns null expiresAtIso when not in progress', () => {
    const entity = checkout({
      status: CheckoutStatus.Completed,
      expiresAt: new Date(Date.now() + CHECKOUT_HOLD_MS),
    });

    expect(entity.expiresAtIso).toBeNull();
  });

  it('sets expiresAt on insert when missing', () => {
    const entity = checkout({ status: CheckoutStatus.InProgress });
    const before = Date.now();

    entity.setDefaultExpiresAt();

    expect(entity.expiresAt.getTime()).toBeGreaterThanOrEqual(before + CHECKOUT_HOLD_MS - 50);
    expect(entity.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + CHECKOUT_HOLD_MS);
  });

  it('keeps an explicit expiresAt on insert', () => {
    const expiresAt = new Date('2020-01-01');
    const entity = checkout({ status: CheckoutStatus.InProgress, expiresAt });

    entity.setDefaultExpiresAt();

    expect(entity.expiresAt).toBe(expiresAt);
  });
});
