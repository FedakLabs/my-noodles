import { AppException, HttpStatus, NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

import { CheckoutStatus } from './checkouts.validators';

export class CheckoutNotFoundException extends NotFoundException {
  static readonly sample = new CheckoutNotFoundException(SAMPLE_UUID);

  constructor(checkoutId?: string) {
    super({
      code: 'checkout_not_found',
      message: 'Checkout not found',
      payload: checkoutId ? { checkoutId } : undefined,
    });
  }
}

/** Checkout exists but is no longer open for edits / submit (completed, cancelled, or hold elapsed). */
export class CheckoutInactiveException extends AppException {
  static readonly sample = new CheckoutInactiveException(SAMPLE_UUID, CheckoutStatus.Completed);

  constructor(checkoutId: string, status: CheckoutStatus) {
    super({
      status: HttpStatus.CONFLICT,
      code: 'checkout_inactive',
      message: 'Checkout is no longer active',
      payload: {
        checkoutId,
        status,
      },
    });
  }
}
