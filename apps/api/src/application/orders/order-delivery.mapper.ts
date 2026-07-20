import { DeliveryMethod, DeliveryProvider } from './order-delivery.dto';
import type { OrderDelivery } from './order-delivery.entity';
import type { CreateOrderDeliveryDto, UpdateOrderDeliveryDto } from './orders.dto';

export function mapDeliveryDtoToEntity(
  orderId: string,
  dto: CreateOrderDeliveryDto,
): Omit<OrderDelivery, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  const isWarehouse = dto.method === DeliveryMethod.Warehouse;
  const isCourier = dto.method === DeliveryMethod.Courier;
  const isCustom = dto.method === DeliveryMethod.Custom;

  return {
    orderId,
    provider: dto.provider,
    method: dto.method,
    city: dto.city?.trim() || null,
    cityRef: dto.cityRef ?? null,
    postalCode: dto.postalCode?.trim() || null,
    warehouseNumber: isWarehouse || isCustom ? (dto.warehouseNumber ?? null) : null,
    warehouseName: isWarehouse || isCustom ? (dto.warehouseName ?? null) : null,
    warehouseRef: isWarehouse || isCustom ? (dto.warehouseRef ?? null) : null,
    street: isCourier || isCustom ? (dto.street ?? null) : null,
    building: isCourier || isCustom ? (dto.building ?? null) : null,
    apartment: isCourier || isCustom ? (dto.apartment ?? null) : null,
    notes: dto.notes ?? null,
    estimatedDeliveryAt: null,
    estimatedDaysMin: null,
    estimatedDaysMax: null,
    shippingCostMinor: null,
  };
}

export function mergeDeliveryDtoToEntity(entity: OrderDelivery, dto: UpdateOrderDeliveryDto): void {
  if (dto.provider !== undefined) {
    entity.provider = dto.provider;
  }
  if (dto.method !== undefined) {
    entity.method = dto.method;
  }
  if (dto.city !== undefined) {
    entity.city = dto.city;
  }
  if (dto.cityRef !== undefined) {
    entity.cityRef = dto.cityRef ?? null;
  }
  if (dto.postalCode !== undefined) {
    entity.postalCode = dto.postalCode ?? null;
  }
  if (dto.warehouseNumber !== undefined) {
    entity.warehouseNumber = dto.warehouseNumber ?? null;
  }
  if (dto.warehouseName !== undefined) {
    entity.warehouseName = dto.warehouseName ?? null;
  }
  if (dto.warehouseRef !== undefined) {
    entity.warehouseRef = dto.warehouseRef ?? null;
  }
  if (dto.street !== undefined) {
    entity.street = dto.street ?? null;
  }
  if (dto.building !== undefined) {
    entity.building = dto.building ?? null;
  }
  if (dto.apartment !== undefined) {
    entity.apartment = dto.apartment ?? null;
  }
  if (dto.notes !== undefined) {
    entity.notes = dto.notes ?? null;
  }
}

export function createPartialDeliveryEntity(
  orderId: string,
  dto: UpdateOrderDeliveryDto,
): Omit<OrderDelivery, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  const method = dto.method ?? DeliveryMethod.Warehouse;

  return {
    orderId,
    provider: dto.provider ?? DeliveryProvider.NovaPoshta,
    method,
    city: dto.city ?? null,
    cityRef: dto.cityRef ?? null,
    postalCode: dto.postalCode ?? null,
    warehouseNumber: dto.warehouseNumber ?? null,
    warehouseName: dto.warehouseName ?? null,
    warehouseRef: dto.warehouseRef ?? null,
    street: dto.street ?? null,
    building: dto.building ?? null,
    apartment: dto.apartment ?? null,
    notes: dto.notes ?? null,
    estimatedDeliveryAt: null,
    estimatedDaysMin: null,
    estimatedDaysMax: null,
    shippingCostMinor: null,
  };
}
