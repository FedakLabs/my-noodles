import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

import { IsPhone } from '@/utils/phone';

import { OrderDeliveryEstimateDto } from '../delivery/delivery.dto';
import {
  CreateOrderDeliveryDto,
  OrderDeliveryResponseDto,
  OrderItemDto,
  UpdateOrderDeliveryDto,
} from '../orders/orders.dto';
import { CheckoutStatus, IsCheckoutStatus } from './checkout-status';

export class ListCheckoutsQueryDto {
  @IsOptional()
  @IsCheckoutStatus()
  status?: CheckoutStatus;
}

export class CheckoutSummaryDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  orderId!: string;

  status!: string;

  itemCount!: number;

  totalMinor!: number;

  currency!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  expiresAt!: string | null;
}

export class CheckoutsListDto {
  items!: CheckoutSummaryDto[];
}

export class CheckoutStartDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  orderId!: string;

  status!: string;

  totalMinor!: number;

  currency!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}

export class CheckoutDetailDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  orderId!: string;

  status!: string;

  totalMinor!: number;

  currency!: string;

  firstName!: string | null;

  lastName!: string | null;

  phone!: string | null;

  items!: OrderItemDto[];

  delivery!: OrderDeliveryResponseDto | null;

  @ApiProperty({ type: OrderDeliveryEstimateDto, nullable: true })
  deliveryEstimate!: OrderDeliveryEstimateDto | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  expiresAt!: string | null;
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
