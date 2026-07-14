import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class OrderNotFoundException extends AppException<{ orderId: string }> {
  constructor(orderId: string) {
    super(HttpStatus.NOT_FOUND, 'order_not_found', 'Order not found', { orderId });
  }
}

export class OrderCancelNotAllowedException extends AppException<{ status: string }> {
  constructor(status: string) {
    super(HttpStatus.CONFLICT, 'order_cancel_not_allowed', 'Order cannot be cancelled', { status });
  }
}

export class OrderInventoryChangedException extends AppException {
  constructor() {
    super(HttpStatus.CONFLICT, 'order_inventory_changed', 'Order details changed due to inventory update');
  }
}
