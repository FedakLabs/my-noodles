import { AppException, HttpStatus, NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

import { CheckoutStatus } from './checkouts.validators';

export class CheckoutNotFoundException extends NotFoundException {
  static readonly sample = new CheckoutNotFoundException(SAMPLE_UUID);

  constructor(checkoutId?: string) {
    super('checkout_not_found', 'Checkout not found', checkoutId ? { checkoutId } : undefined);
  }
}

/** Checkout exists but is no longer open for edits / submit (completed, cancelled, or hold elapsed). */
export class CheckoutInactiveException extends AppException<{ checkoutId: string; status: CheckoutStatus }> {
  static readonly sample = new CheckoutInactiveException(SAMPLE_UUID, CheckoutStatus.Completed);

  constructor(checkoutId: string, status: CheckoutStatus) {
    super(HttpStatus.CONFLICT, 'checkout_inactive', 'Checkout is no longer active', {
      checkoutId,
      status,
    });
  }
}
