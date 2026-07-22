import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

import {
  DeliveryMethod,
  DeliveryProvider,
  IsDeliveryMethod,
  IsDeliveryProvider,
} from '../orders/order-delivery.dto';
import type { DeliveryCity, DeliveryWarehouse } from './delivery.types';

export class DeliveryMethodDto {
  @ApiProperty({ enum: DeliveryMethod, enumName: 'DeliveryMethod' })
  id!: DeliveryMethod;

  label!: string;
}

export class DeliveryProviderDto {
  @ApiProperty({ enum: DeliveryProvider, enumName: 'DeliveryProvider' })
  id!: DeliveryProvider;

  label!: string;

  @ApiProperty({ type: [DeliveryMethodDto] })
  methods!: DeliveryMethodDto[];
}

export class DeliveryCityDto implements DeliveryCity {
  ref!: string;

  name!: string;
}

export class DeliveryWarehouseDto implements DeliveryWarehouse {
  ref!: string;

  number!: string;

  name!: string;

  address?: string;
}

export class DeliveryCityQueryDto {
  @IsDeliveryProvider()
  provider!: DeliveryProvider;

  @IsDeliveryMethod()
  method!: DeliveryMethod;

  @IsOptional()
  @IsString()
  q?: string;
}

export class DeliveryWarehouseQueryDto {
  @IsDeliveryProvider()
  provider!: DeliveryProvider;

  @IsString()
  @MinLength(1)
  cityRef!: string;

  @IsOptional()
  @IsString()
  q?: string;
}

export class OrderDeliveryEstimateDto {
  @ApiProperty({ type: String, format: 'date-time' })
  estimatedDeliveryAt!: string;

  estimatedDaysMin!: number;

  estimatedDaysMax!: number;

  @ApiProperty({ nullable: true, type: Number })
  shippingCostMinor!: number | null;
}
