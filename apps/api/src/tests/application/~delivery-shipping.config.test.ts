import { computeShippingCostMinor } from '@/application/delivery/delivery-shipping.config';
import { DeliveryMethod, DeliveryProvider } from '@/application/orders';

describe('computeShippingCostMinor', () => {
  it('returns flat warehouse rates per provider', () => {
    expect(computeShippingCostMinor(DeliveryProvider.NovaPoshta, DeliveryMethod.Warehouse)).toBe(6_500);
    expect(computeShippingCostMinor(DeliveryProvider.Meest, DeliveryMethod.Warehouse)).toBe(7_500);
    expect(computeShippingCostMinor(DeliveryProvider.Ukrposhta, DeliveryMethod.Warehouse)).toBe(5_500);
  });

  it('adds courier surcharge', () => {
    expect(computeShippingCostMinor(DeliveryProvider.NovaPoshta, DeliveryMethod.Courier)).toBe(9_500);
  });
});
