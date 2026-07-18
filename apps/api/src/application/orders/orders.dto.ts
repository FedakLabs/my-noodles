import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

import { IsOrderCancelledReason, OrderCancelledReason } from './order-cancelled-reason';
import { DeliveryMethod, DeliveryProvider, IsDeliveryMethod, IsDeliveryProvider } from './order-delivery.dto';

export class UpdateOrderDeliveryDto {
  @IsOptional()
  @IsDeliveryProvider()
  provider?: DeliveryProvider;

  @IsOptional()
  @IsDeliveryMethod()
  method?: DeliveryMethod;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cityRef?: string;

  @ValidateIf((delivery: UpdateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  warehouseNumber?: string;

  @ValidateIf((delivery: UpdateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  warehouseName?: string;

  @ValidateIf((delivery: UpdateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  warehouseRef?: string;

  @ValidateIf((delivery: UpdateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  street?: string;

  @ValidateIf((delivery: UpdateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  building?: string;

  @ValidateIf((delivery: UpdateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CreateOrderDeliveryDto {
  @IsDeliveryProvider()
  provider!: DeliveryProvider;

  @IsDeliveryMethod()
  method!: DeliveryMethod;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  cityRef!: string;

  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  warehouseNumber?: string;

  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  warehouseName?: string;

  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  warehouseRef?: string;

  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street?: string;

  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  building?: string;

  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CancelOrderDto {
  @IsOrderCancelledReason()
  reason!: OrderCancelledReason;
}
