import { AppException, HttpStatus, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class OrderNotFoundException extends AppException<{ orderId: string }> {
  static readonly sample = new OrderNotFoundException(SAMPLE_UUID);

  constructor(orderId: string) {
    super(HttpStatus.NOT_FOUND, 'order_not_found', 'Order not found', { orderId });
  }
}

export class OrderCancelNotAllowedException extends AppException<{ status: string }> {
  static readonly sample = new OrderCancelNotAllowedException('draft');

  constructor(status: string) {
    super(HttpStatus.CONFLICT, 'order_cancel_not_allowed', 'Order cannot be cancelled', { status });
  }
}

export class OrderInventoryChangedException extends AppException {
  static readonly sample = new OrderInventoryChangedException();

  constructor() {
    super(HttpStatus.CONFLICT, 'order_inventory_changed', 'Order details changed due to inventory update');
  }
}
