import { AppException, HttpStatus, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class OrderNotFoundException extends AppException {
  static readonly sample = new OrderNotFoundException(SAMPLE_UUID);

  constructor(orderId: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      code: 'order_not_found',
      message: 'Order not found',
      payload: { orderId },
    });
  }
}

export class OrderCancelNotAllowedException extends AppException {
  static readonly sample = new OrderCancelNotAllowedException('draft');

  constructor(status: string) {
    super({
      status: HttpStatus.CONFLICT,
      code: 'order_cancel_not_allowed',
      message: 'Order cannot be cancelled',
      payload: { status },
    });
  }
}

export class OrderInventoryChangedException extends AppException {
  static readonly sample = new OrderInventoryChangedException();

  constructor() {
    super({
      status: HttpStatus.CONFLICT,
      code: 'order_inventory_changed',
      message: 'Order details changed due to inventory update',
    });
  }
}
