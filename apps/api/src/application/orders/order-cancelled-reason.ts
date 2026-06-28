import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

/** Post-submit manager cancel only — never set on draft orders. */
export enum OrderCancelledReason {
  CustomerRequest = 'customer_request',
  OutOfStock = 'out_of_stock',
}

export function IsOrderCancelledReason(): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ enum: OrderCancelledReason, enumName: 'OrderCancelledReason' })(target, propertyKey);
    IsEnum(OrderCancelledReason)(target, propertyKey);
  };
}
