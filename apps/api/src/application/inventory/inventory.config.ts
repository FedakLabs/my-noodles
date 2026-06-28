import type { FindOptionsWhere } from 'typeorm';

import { CheckoutStatus } from '../checkouts/checkout-status';

export function inProgressCheckoutWhere(): FindOptionsWhere<{ status: CheckoutStatus }> {
  return { status: CheckoutStatus.InProgress };
}
