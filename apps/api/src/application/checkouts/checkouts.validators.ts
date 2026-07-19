import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum CheckoutStatus {
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum CheckoutCancelledReason {
  User = 'user',
  Expired = 'expired',
}

export function IsCheckoutStatus(): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ enum: CheckoutStatus, enumName: 'CheckoutStatus' })(target, propertyKey);
    IsEnum(CheckoutStatus)(target, propertyKey);
  };
}

export function IsCheckoutCancelledReason(): PropertyDecorator {
  return (target, propertyKey) => {
    ApiProperty({ enum: CheckoutCancelledReason, enumName: 'CheckoutCancelledReason' })(target, propertyKey);
    IsEnum(CheckoutCancelledReason)(target, propertyKey);
  };
}
