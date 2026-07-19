import { CHECKOUT_HOLD_MS, Checkout } from '@/application/checkouts/checkout.entity';
import { CheckoutCancelledReason, CheckoutStatus } from '@/application/checkouts/checkouts.validators';

import { describe, expect, it } from '../jest-globals';

function checkout(partial: Partial<Checkout>): Checkout {
  return Object.assign(new Checkout(), partial);
}

describe('Checkout entity', () => {
  it('marks past expiresAt as hold-elapsed', () => {
    const entity = checkout({
      status: CheckoutStatus.InProgress,
      expiresAt: new Date(Date.now() - 1),
    });

    expect(entity.isHoldElapsed).toBe(true);
    expect(entity.isExpired).toBe(false);
  });

  it('marks cancelled-as-expired as expired', () => {
    const entity = checkout({
      status: CheckoutStatus.Cancelled,
      cancelledReason: CheckoutCancelledReason.Expired,
      expiresAt: new Date(Date.now() - 1),
    });

    expect(entity.isHoldElapsed).toBe(true);
    expect(entity.isExpired).toBe(true);
  });

  it('does not mark user-cancelled as expired', () => {
    const entity = checkout({
      status: CheckoutStatus.Cancelled,
      cancelledReason: CheckoutCancelledReason.User,
      expiresAt: new Date(Date.now() - 1),
    });

    expect(entity.isHoldElapsed).toBe(true);
    expect(entity.isExpired).toBe(false);
  });

  it('keeps active checkouts before expiresAt', () => {
    const entity = checkout({
      status: CheckoutStatus.InProgress,
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(entity.isHoldElapsed).toBe(false);
    expect(entity.isExpired).toBe(false);
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
