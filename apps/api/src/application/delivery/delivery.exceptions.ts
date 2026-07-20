import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

import type { DeliveryMethod, DeliveryProvider } from '../orders/order-delivery.dto';

export class InvalidDeliveryProviderException extends AppException {
  constructor(provider: DeliveryProvider) {
    super({
      status: HttpStatus.BAD_REQUEST,
      code: 'invalid_delivery_provider',
      message: 'Invalid delivery provider',
      payload: { provider },
    });
  }
}

export class InvalidDeliveryMethodForProviderException extends AppException {
  constructor(provider: DeliveryProvider, method: DeliveryMethod) {
    super({
      status: HttpStatus.BAD_REQUEST,
      code: 'invalid_delivery_method_for_provider',
      message: 'Delivery method is not available for this provider',
      payload: { provider, method },
    });
  }
}
