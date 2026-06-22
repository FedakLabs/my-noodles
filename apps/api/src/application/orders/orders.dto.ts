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

import {
  DELIVERY_METHOD_OPENAPI,
  DELIVERY_PROVIDER_OPENAPI,
  DeliveryMethod,
  DeliveryProvider,
} from './order-delivery.dto';

export class CreateOrderItemDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @Transform(({ value }) => parseIntQuery(value))
  @IsInt()
  @Min(1)
  qty!: number;
}

export class CreateOrderDeliveryDto {
  @ApiProperty(DELIVERY_PROVIDER_OPENAPI)
  @IsEnum(DeliveryProvider)
  provider!: DeliveryProvider;

  @ApiProperty(DELIVERY_METHOD_OPENAPI)
  @IsEnum(DeliveryMethod)
  method!: DeliveryMethod;

  @ApiProperty({ type: String, example: 'Київ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @ApiPropertyOptional({ type: String, description: 'Required when method is warehouse' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  warehouseNumber?: string;

  @ApiPropertyOptional({ type: String })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  warehouseName?: string;

  @ApiPropertyOptional({ type: String, description: 'Provider API ref for warehouse (future integrations)' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Warehouse)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  warehouseRef?: string;

  @ApiPropertyOptional({ type: String, description: 'Required when method is courier' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street?: string;

  @ApiPropertyOptional({ type: String, description: 'Required when method is courier' })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  building?: string;

  @ApiPropertyOptional({ type: String })
  @ValidateIf((delivery: CreateOrderDeliveryDto) => delivery.method === DeliveryMethod.Courier)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName!: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @ApiProperty({ type: () => CreateOrderDeliveryDto })
  @ValidateNested()
  @Type(() => CreateOrderDeliveryDto)
  delivery!: CreateOrderDeliveryDto;

  @ApiProperty({ type: () => [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({ type: String, description: 'Honeypot field — must stay empty' })
  @IsOptional()
  @IsString()
  @MaxLength(0)
  company?: string;
}

export class OrderResponseDto {
  @ApiProperty({ type: String, format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String })
  status!: string;

  @ApiProperty({ type: Number })
  totalMinor!: number;

  @ApiProperty({ type: String })
  currency!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}
