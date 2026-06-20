import { DeliveryMethod } from './order-delivery.dto';
import type { OrderDelivery } from './order-delivery.entity';
import type { CreateOrderDeliveryDto } from './orders.dto';

export function mapDeliveryDtoToEntity(
  orderId: string,
  dto: CreateOrderDeliveryDto,
): Omit<OrderDelivery, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  const isWarehouse = dto.method === DeliveryMethod.Warehouse;

  return {
    orderId,
    provider: dto.provider,
    method: dto.method,
    city: dto.city,
    warehouseNumber: isWarehouse ? (dto.warehouseNumber ?? null) : null,
    warehouseName: isWarehouse ? (dto.warehouseName ?? null) : null,
    warehouseRef: isWarehouse ? (dto.warehouseRef ?? null) : null,
    street: isWarehouse ? null : (dto.street ?? null),
    building: isWarehouse ? null : (dto.building ?? null),
    apartment: isWarehouse ? null : (dto.apartment ?? null),
    notes: dto.notes ?? null,
  };
}
