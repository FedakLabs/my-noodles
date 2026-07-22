import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class OrderCreatedDateRangeInvalidException extends AppException {
  static readonly sample = new OrderCreatedDateRangeInvalidException('2026-02-01', '2026-01-01');

  constructor(createdFrom: string, createdTo: string) {
    super({
      status: HttpStatus.BAD_REQUEST,
      code: 'order_created_date_range_invalid',
      message: 'createdFrom must be on or before createdTo',
      payload: { createdFrom, createdTo },
    });
  }
}

export class OrderTransitionNotAllowedException extends AppException {
  static readonly sample = new OrderTransitionNotAllowedException('new', 'completed');

  constructor(from: string, to: string) {
    super({
      status: HttpStatus.CONFLICT,
      code: 'order_transition_not_allowed',
      message: 'Order status transition is not allowed',
      payload: { from, to },
    });
  }
}
