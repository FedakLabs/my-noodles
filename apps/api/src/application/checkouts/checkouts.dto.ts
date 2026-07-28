import { ApiEnum, IsPhone } from '@my-noodles/api-lib/nest';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

import { CreateOrderDeliveryDto, UpdateOrderDeliveryDto } from '../orders/orders.dto';
import { CheckoutCancelledReason, CheckoutStatus } from './checkouts.validators';

export class ListCheckoutsQueryDto {
  @IsOptional()
  @ApiEnum(CheckoutStatus, 'CheckoutStatus')
  status?: CheckoutStatus;
}

export class CancelCheckoutDto {
  @ApiEnum(CheckoutCancelledReason, 'CheckoutCancelledReason')
  reason!: CheckoutCancelledReason;
}

export class SubmitCheckoutDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;

  @IsPhone()
  @MaxLength(30)
  phone!: string;

  @ValidateNested()
  @Type(() => CreateOrderDeliveryDto)
  delivery!: CreateOrderDeliveryDto;
}

export class UpdateCheckoutReceiverDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsPhone()
  @MaxLength(30)
  phone?: string;
}

export class UpdateCheckoutDeliveryDto extends UpdateOrderDeliveryDto {}
