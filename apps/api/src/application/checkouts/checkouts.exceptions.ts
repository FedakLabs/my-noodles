import { HttpStatus } from '@my-noodles/api-lib/exceptions';

import { AppException, NotFoundException } from '@/infrastructure/exceptions';

export class CheckoutNotFoundException extends NotFoundException {
  constructor(checkoutId: string) {
    super('checkout_not_found', 'Checkout not found', { checkoutId });
  }
}

export class CheckoutExpiredException extends AppException<{ checkoutId: string }> {
  constructor(checkoutId: string) {
    super(HttpStatus.CONFLICT, 'checkout_expired', 'Checkout expired', { checkoutId });
  }
}

export class CheckoutNotInProgressException extends AppException<{ checkoutId: string; status: string }> {
  constructor(checkoutId: string, status: string) {
    super(HttpStatus.CONFLICT, 'checkout_not_in_progress', 'Checkout is no longer in progress', {
      checkoutId,
      status,
    });
  }
}
