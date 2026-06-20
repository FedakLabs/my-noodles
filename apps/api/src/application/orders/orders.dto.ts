import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
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

import { parseIntQuery } from '@/utils/transformers';

import { DELIVERY_METHODS, DELIVERY_PROVIDERS, DeliveryMethod, DeliveryProvider } from './order-delivery.dto';

export class CreateOrderItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ minimum: 1 })
  @Transform(({ value }) => parseIntQuery(value))
  @IsInt()
  @Min(1)
  qty!: number;
}

export class CreateOrderDeliveryDto {
  @ApiProperty({ enum: DELIVERY_PROVIDERS })
  @IsEnum(DeliveryProvider)
  provider!: DeliveryProvider;

  @ApiProperty({ enum: DELIVERY_METHODS })
  @IsEnum(DeliveryMethod)
  method!: DeliveryMethod;

  @ApiProperty({ example: 'Київ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @ApiPropertyOptional({ description: 'Required when method is warehouse' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  warehouseNumber?: string;

  @ApiPropertyOptional()
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  warehouseName?: string;

  @ApiPropertyOptional({ description: 'Provider API ref for warehouse (future integrations)' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  warehouseRef?: string;

  @ApiPropertyOptional({ description: 'Required when method is courier' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street?: string;

  @ApiPropertyOptional({ description: 'Required when method is courier' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  building?: string;

  @ApiPropertyOptional()
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @ApiProperty({ type: CreateOrderDeliveryDto })
  @ValidateNested()
  @Type(() => CreateOrderDeliveryDto)
  delivery!: CreateOrderDeliveryDto;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({ description: 'Honeypot field — must stay empty' })
  @IsOptional()
  @IsString()
  @MaxLength(0)
  company?: string;
}

export class OrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  totalMinor!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  createdAt!: string;
}
