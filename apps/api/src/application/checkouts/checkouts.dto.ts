import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

import { IsPhone } from '@/utils/phone';

import { CreateOrderDeliveryDto, UpdateOrderDeliveryDto } from '../orders/orders.dto';
import { CheckoutStatus, IsCheckoutStatus } from './checkout-status';

export class ListCheckoutsQueryDto {
  @IsOptional()
  @IsCheckoutStatus()
  status?: CheckoutStatus;
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
