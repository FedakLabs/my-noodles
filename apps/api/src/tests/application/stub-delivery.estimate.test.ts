import { MeestDeliveryAdapter } from '@/application/delivery/providers/meest.adapter';
import { NovaPoshtaDeliveryAdapter } from '@/application/delivery/providers/nova-poshta.adapter';
import { StubDeliveryEstimate } from '@/application/delivery/providers/stub-delivery.estimate';
import { UkrposhtaDeliveryAdapter } from '@/application/delivery/providers/ukrposhta.adapter';
import { DeliveryMethod, DeliveryProvider } from '@/application/orders';

describe('StubDeliveryEstimate (via provider adapters)', () => {
  const stubEstimate = new StubDeliveryEstimate();
  const novaPoshta = new NovaPoshtaDeliveryAdapter({} as never, stubEstimate);
  const meest = new MeestDeliveryAdapter({} as never, stubEstimate);
  const ukrposhta = new UkrposhtaDeliveryAdapter({} as never, stubEstimate);

  it('uses per-adapter warehouse ETA stubs with unknown shipping cost', async () => {
    const orderCreatedAt = new Date('2025-06-20T10:00:00.000Z');

    await expect(
      novaPoshta.estimate({
        provider: DeliveryProvider.NovaPoshta,
        method: DeliveryMethod.Warehouse,
        orderCreatedAt,
        itemCount: 1,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        estimatedDaysMin: 2,
        estimatedDaysMax: 4,
        shippingCostMinor: null,
      }),
    );

    await expect(
      meest.estimate({
        provider: DeliveryProvider.Meest,
        method: DeliveryMethod.Warehouse,
        orderCreatedAt,
        itemCount: 1,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        estimatedDaysMin: 2,
        estimatedDaysMax: 4,
        shippingCostMinor: null,
      }),
    );

    await expect(
      ukrposhta.estimate({
        provider: DeliveryProvider.Ukrposhta,
        method: DeliveryMethod.Custom,
        orderCreatedAt,
        itemCount: 1,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        estimatedDaysMin: 3,
        estimatedDaysMax: 6,
        shippingCostMinor: null,
      }),
    );
  });

  it('keeps courier ETA stubs with unknown shipping cost', async () => {
    const orderCreatedAt = new Date('2025-06-20T10:00:00.000Z');

    await expect(
      novaPoshta.estimate({
        provider: DeliveryProvider.NovaPoshta,
        method: DeliveryMethod.Courier,
        orderCreatedAt,
        itemCount: 1,
      }),
    ).resolves.toEqual(expect.objectContaining({ shippingCostMinor: null }));

    await expect(
      meest.estimate({
        provider: DeliveryProvider.Meest,
        method: DeliveryMethod.Courier,
        orderCreatedAt,
        itemCount: 1,
      }),
    ).resolves.toEqual(expect.objectContaining({ shippingCostMinor: null }));
  });
});
