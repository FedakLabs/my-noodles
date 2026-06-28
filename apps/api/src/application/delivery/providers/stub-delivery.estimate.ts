import { DeliveryMethod, DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimate, DeliveryEstimateInput } from '../delivery.types';
import { computeShippingCostMinor } from '../delivery-shipping.config';

const DISPATCH_CUTOFF_HOUR = 14;

const PROVIDER_EXTRA_DAYS: Record<DeliveryProvider, number> = {
  [DeliveryProvider.NovaPoshta]: 0,
  [DeliveryProvider.Meest]: 1,
  [DeliveryProvider.Ukrposhta]: 1,
};

export function computeStubEstimate(input: DeliveryEstimateInput): DeliveryEstimate {
  const extraDays = PROVIDER_EXTRA_DAYS[input.provider];
  const isWarehouse = input.method === DeliveryMethod.Warehouse;
  const estimatedDaysMin = (isWarehouse ? 2 : 1) + extraDays;
  const estimatedDaysMax = (isWarehouse ? 3 : 2) + extraDays;

  const now = new Date();
  const dispatchDate = resolveDispatchDate(input.orderCreatedAt, now);
  const estimatedDeliveryAt = addCalendarDays(dispatchDate, estimatedDaysMin);

  return {
    estimatedDeliveryAt: estimatedDeliveryAt.toISOString(),
    estimatedDaysMin,
    estimatedDaysMax,
    shippingCostMinor: computeShippingCostMinor(input.provider, input.method),
  };
}

function resolveDispatchDate(orderCreatedAt: Date, now: Date): Date {
  const reference = now.getTime() > orderCreatedAt.getTime() ? now : orderCreatedAt;
  const dispatch = new Date(reference);
  dispatch.setHours(0, 0, 0, 0);

  if (reference.getHours() >= DISPATCH_CUTOFF_HOUR) {
    dispatch.setDate(dispatch.getDate() + 1);
  }

  return dispatch;
}

function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
