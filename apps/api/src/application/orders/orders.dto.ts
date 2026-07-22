import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

import { DeliveryMethod, DeliveryProvider, IsDeliveryMethod, IsDeliveryProvider } from './order-delivery.dto';

function isCustomDelivery(delivery: { method?: DeliveryMethod }): boolean {
  return delivery.method === DeliveryMethod.Custom;
}

function hasOptionalText(value: string | undefined | null): boolean {
  return value != null && value !== '';
}

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

  @IsOptional()
  @IsString()
  @MaxLength(16)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  warehouseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  warehouseName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  warehouseRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  building?: string;

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

  @ValidateIf(
    (delivery: CreateOrderDeliveryDto) => !isCustomDelivery(delivery) || hasOptionalText(delivery.city),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city?: string;

  @ValidateIf((delivery: CreateOrderDeliveryDto) => !isCustomDelivery(delivery))
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  cityRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  postalCode?: string;

  @ValidateIf(
    (delivery: CreateOrderDeliveryDto) =>
      delivery.method === DeliveryMethod.Warehouse ||
      (isCustomDelivery(delivery) && hasOptionalText(delivery.warehouseNumber)),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  warehouseNumber?: string;

  @ValidateIf(
    (delivery: CreateOrderDeliveryDto) =>
      delivery.method === DeliveryMethod.Warehouse || isCustomDelivery(delivery),
  )
  @IsOptional()
  @IsString()
  @MaxLength(200)
  warehouseName?: string;

  @ValidateIf(
    (delivery: CreateOrderDeliveryDto) =>
      delivery.method === DeliveryMethod.Warehouse ||
      (isCustomDelivery(delivery) && hasOptionalText(delivery.warehouseRef)),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  warehouseRef?: string;

  @ValidateIf(
    (delivery: CreateOrderDeliveryDto) =>
      delivery.method === DeliveryMethod.Courier ||
      (isCustomDelivery(delivery) && hasOptionalText(delivery.street)),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  street?: string;

  @ValidateIf(
    (delivery: CreateOrderDeliveryDto) =>
      delivery.method === DeliveryMethod.Courier ||
      (isCustomDelivery(delivery) && hasOptionalText(delivery.building)),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  building?: string;

  @ValidateIf(
    (delivery: CreateOrderDeliveryDto) =>
      delivery.method === DeliveryMethod.Courier || isCustomDelivery(delivery),
  )
  @IsOptional()
  @IsString()
  @MaxLength(20)
  apartment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}
