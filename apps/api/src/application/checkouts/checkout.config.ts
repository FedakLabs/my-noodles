import { CheckoutStatus } from './checkout-status';
import type { Checkout } from './checkout.entity';

/** Checkout hold — fixed from checkout.created_at (not sliding on PATCH). */
export const CHECKOUT_HOLD_MS = 15 * 60_000;

export function checkoutHoldMinCreatedAt(now = Date.now()): Date {
  return new Date(now - CHECKOUT_HOLD_MS);
}

export function isCheckoutExpired(checkout: Checkout, now = Date.now()): boolean {
  return (
    checkout.status === CheckoutStatus.InProgress &&
    checkout.createdAt.getTime() <= checkoutHoldMinCreatedAt(now).getTime()
  );
}

export function checkoutExpiresAt(checkout: Checkout): string {
  return new Date(checkout.createdAt.getTime() + CHECKOUT_HOLD_MS).toISOString();
}
