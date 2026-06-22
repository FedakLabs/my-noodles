import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { TransformToInt } from '@/utils/transformers';

import { DeliveryMethod, DeliveryProvider, IsDeliveryMethod, IsDeliveryProvider } from './order-delivery.dto';

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @TransformToInt()
  @IsInt()
  @Min(1)
  qty!: number;
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
  @IsOptional()
  @IsString()
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

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @ValidateNested()
  @Type(() => CreateOrderDeliveryDto)
  delivery!: CreateOrderDeliveryDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(0)
  company?: string;
}

export class OrderResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  status!: string;

  totalMinor!: number;

  currency!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}
