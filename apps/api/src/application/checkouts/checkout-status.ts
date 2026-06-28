import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum CheckoutStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export function IsCheckoutStatus(): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ enum: CheckoutStatus, enumName: 'CheckoutStatus' })(target, propertyKey);
    IsEnum(CheckoutStatus)(target, propertyKey);
  };
}
