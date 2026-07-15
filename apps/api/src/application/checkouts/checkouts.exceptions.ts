import { AppException, HttpStatus, NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class CheckoutNotFoundException extends NotFoundException {
  static readonly sample = new CheckoutNotFoundException(SAMPLE_UUID);

  constructor(checkoutId: string) {
    super('checkout_not_found', 'Checkout not found', { checkoutId });
  }
}

export class CheckoutExpiredException extends AppException<{ checkoutId: string }> {
  static readonly sample = new CheckoutExpiredException(SAMPLE_UUID);

  constructor(checkoutId: string) {
    super(HttpStatus.CONFLICT, 'checkout_expired', 'Checkout expired', { checkoutId });
  }
}

export class CheckoutNotInProgressException extends AppException<{ checkoutId: string; status: string }> {
  static readonly sample = new CheckoutNotInProgressException(SAMPLE_UUID, 'completed');

  constructor(checkoutId: string, status: string) {
    super(HttpStatus.CONFLICT, 'checkout_not_in_progress', 'Checkout is no longer in progress', {
      checkoutId,
      status,
    });
  }
}
