import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

import type { DeliveryProvider } from '../orders/order-delivery.dto';

export class InvalidDeliveryProviderException extends AppException<{ provider: DeliveryProvider }> {
  constructor(provider: DeliveryProvider) {
    super(HttpStatus.BAD_REQUEST, 'invalid_delivery_provider', 'Invalid delivery provider', { provider });
  }
}
