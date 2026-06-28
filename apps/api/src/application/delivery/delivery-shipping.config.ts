import { DeliveryMethod, DeliveryProvider } from '../orders/order-delivery.dto';

/** Flat warehouse pickup rates in minor units (UAH kopiyky). Replace with provider quotes later. */
const WAREHOUSE_SHIPPING_MINOR: Record<DeliveryProvider, number> = {
  [DeliveryProvider.NovaPoshta]: 6_500,
  [DeliveryProvider.Meest]: 7_500,
  [DeliveryProvider.Ukrposhta]: 5_500,
};

const COURIER_SURCHARGE_MINOR = 3_000;

export function computeShippingCostMinor(provider: DeliveryProvider, method: DeliveryMethod): number {
  const base = WAREHOUSE_SHIPPING_MINOR[provider];

  return method === DeliveryMethod.Courier ? base + COURIER_SURCHARGE_MINOR : base;
}
