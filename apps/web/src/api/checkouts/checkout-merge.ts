import type { CheckoutDetailDto, OrderDeliveryResponseDto } from '@my-noodles/api-clients/storefront';

function mergeDelivery(
  current: OrderDeliveryResponseDto | null,
  incoming: OrderDeliveryResponseDto | null,
): OrderDeliveryResponseDto | null {
  if (!incoming) {
    return current;
  }

  if (!current) {
    return incoming;
  }

  return {
    ...current,
    ...incoming,
    city: incoming.city ?? current.city,
    warehouseNumber: incoming.warehouseNumber ?? current.warehouseNumber,
    warehouseName: incoming.warehouseName ?? current.warehouseName,
    warehouseRef: incoming.warehouseRef ?? current.warehouseRef,
    street: incoming.street ?? current.street,
    building: incoming.building ?? current.building,
    apartment: incoming.apartment ?? current.apartment,
    notes: incoming.notes ?? current.notes,
  };
}

/** Merge a partial/stale PATCH response into cached checkout without dropping saved fields. */
export function mergeCheckoutDetail(
  current: CheckoutDetailDto | undefined,
  incoming: CheckoutDetailDto,
): CheckoutDetailDto {
  if (!current) {
    return incoming;
  }

  return {
    ...incoming,
    firstName: incoming.firstName ?? current.firstName,
    lastName: incoming.lastName ?? current.lastName,
    phone: incoming.phone ?? current.phone,
    delivery: mergeDelivery(current.delivery, incoming.delivery),
    deliveryEstimate: incoming.deliveryEstimate ?? current.deliveryEstimate,
  };
}
