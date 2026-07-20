import { LocaleContext } from '@my-noodles/api-lib/locale';

import { DeliveryCatalogCache } from '@/application/delivery/delivery-catalog.cache';
import { DeliveryMethodsService } from '@/application/delivery/delivery-methods.service';
import { DeliveryService } from '@/application/delivery/delivery.service';
import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';
import { DeliveryProviderFactory } from '@/application/delivery/providers/delivery-provider.factory';
import { MeestDeliveryAdapter } from '@/application/delivery/providers/meest.adapter';
import { NovaPoshtaDeliveryAdapter } from '@/application/delivery/providers/nova-poshta.adapter';
import { StubDeliveryEstimate } from '@/application/delivery/providers/stub-delivery.estimate';
import { UkrposhtaDeliveryAdapter } from '@/application/delivery/providers/ukrposhta.adapter';
import { DeliveryMethod, DeliveryProvider } from '@/application/orders';

import { describe, expect, it, jest } from '../jest-globals';

const stubCities: DeliveryCity[] = [
  { ref: 'city-kyiv', name: 'Київ' },
  { ref: 'city-lviv', name: 'Львів' },
];

const stubWarehouses: DeliveryWarehouse[] = [
  { ref: 'wh-kyiv-1', number: '1', name: 'Відділення №1', address: 'вул. Центральна, 1' },
];

function createFactory() {
  const novaPoshtaService = {
    searchCities: jest.fn((query: string) =>
      Promise.resolve(stubCities.filter((city) => city.name.toLowerCase().includes(query.toLowerCase()))),
    ),
    searchWarehouses: jest.fn(() => Promise.resolve(stubWarehouses)),
  };
  const meestService = {
    searchCities: jest.fn(() => Promise.resolve(stubCities)),
    searchWarehouses: jest.fn(() => Promise.resolve(stubWarehouses)),
  };
  const ukrposhtaService = {
    searchCities: jest.fn(() => Promise.resolve(stubCities)),
    searchWarehouses: jest.fn(() => Promise.resolve(stubWarehouses)),
  };

  const stubEstimate = new StubDeliveryEstimate();

  return {
    factory: new DeliveryProviderFactory(
      new NovaPoshtaDeliveryAdapter(novaPoshtaService as never, stubEstimate),
      new MeestDeliveryAdapter(meestService as never, stubEstimate),
      new UkrposhtaDeliveryAdapter(ukrposhtaService as never, stubEstimate),
    ),
    novaPoshtaService,
    meestService,
  };
}

describe('DeliveryService', () => {
  const { factory } = createFactory();
  const cache = new DeliveryCatalogCache();
  const deliveryMethodsService = new DeliveryMethodsService();
  const service = new DeliveryService(factory, cache, deliveryMethodsService);

  it('lists all delivery providers with locale-aware labels and available methods', () => {
    LocaleContext.run('uk', () => {
      expect(service.listProviders()).toEqual([
        {
          id: DeliveryProvider.NovaPoshta,
          label: 'Нова Пошта',
          methods: [
            { id: DeliveryMethod.Warehouse, label: 'Відділення або поштомат' },
            { id: DeliveryMethod.Courier, label: "Кур'єр" },
            { id: DeliveryMethod.Custom, label: 'Інший спосіб' },
          ],
        },
        {
          id: DeliveryProvider.Meest,
          label: 'Meest',
          methods: [
            { id: DeliveryMethod.Warehouse, label: 'Відділення або поштомат' },
            { id: DeliveryMethod.Courier, label: "Кур'єр" },
            { id: DeliveryMethod.Custom, label: 'Інший спосіб' },
          ],
        },
        {
          id: DeliveryProvider.Ukrposhta,
          label: 'Укрпошта',
          methods: [{ id: DeliveryMethod.Custom, label: 'Інший спосіб' }],
        },
      ]);
    });

    LocaleContext.run('en', () => {
      expect(service.listProviders()).toEqual([
        {
          id: DeliveryProvider.NovaPoshta,
          label: 'Nova Poshta',
          methods: [
            { id: DeliveryMethod.Warehouse, label: 'Branch or parcel locker' },
            { id: DeliveryMethod.Courier, label: 'Courier' },
            { id: DeliveryMethod.Custom, label: 'Other arrangement' },
          ],
        },
        {
          id: DeliveryProvider.Meest,
          label: 'Meest',
          methods: [
            { id: DeliveryMethod.Warehouse, label: 'Branch or parcel locker' },
            { id: DeliveryMethod.Courier, label: 'Courier' },
            { id: DeliveryMethod.Custom, label: 'Other arrangement' },
          ],
        },
        {
          id: DeliveryProvider.Ukrposhta,
          label: 'Ukrposhta',
          methods: [{ id: DeliveryMethod.Custom, label: 'Other arrangement' }],
        },
      ]);
    });
  });

  it('returns empty cities for a blank query', async () => {
    const cities = await service.searchCities(DeliveryProvider.NovaPoshta, '', DeliveryMethod.Warehouse);

    expect(cities).toEqual([]);
  });

  it('searches cities by query', async () => {
    const cities: DeliveryCity[] = await service.searchCities(
      DeliveryProvider.NovaPoshta,
      'ки',
      DeliveryMethod.Warehouse,
    );

    expect(cities.some((city) => city.name === 'Київ')).toBe(true);
  });

  it('returns warehouses for a city ref', async () => {
    const warehouses: DeliveryWarehouse[] = await service.searchWarehouses(
      DeliveryProvider.Meest,
      'city-kyiv',
    );

    expect(warehouses.length).toBeGreaterThan(0);
    expect(warehouses[0]?.ref).toMatch(/^wh-kyiv-/);
  });

  it('serves catalog results from cache on repeated city search', async () => {
    const { factory: localFactory } = createFactory();
    const localCache = new DeliveryCatalogCache();
    const localService = new DeliveryService(localFactory, localCache, deliveryMethodsService);
    const adapter = localFactory.get(DeliveryProvider.NovaPoshta);
    const searchCities = jest.spyOn(adapter, 'searchCities');

    await localService.searchCities(DeliveryProvider.NovaPoshta, 'lv', DeliveryMethod.Warehouse);
    await localService.searchCities(DeliveryProvider.NovaPoshta, 'lv', DeliveryMethod.Warehouse);

    expect(searchCities).toHaveBeenCalledTimes(1);
    searchCities.mockRestore();
  });

  it('keeps separate city cache entries per delivery method', async () => {
    const { factory: localFactory, novaPoshtaService } = createFactory();
    const localCache = new DeliveryCatalogCache();
    const localService = new DeliveryService(localFactory, localCache, deliveryMethodsService);

    await localService.searchCities(DeliveryProvider.NovaPoshta, 'ки', DeliveryMethod.Warehouse);
    await localService.searchCities(DeliveryProvider.NovaPoshta, 'ки', DeliveryMethod.Courier);

    expect(novaPoshtaService.searchCities).toHaveBeenCalledWith('ки', DeliveryMethod.Warehouse);
    expect(novaPoshtaService.searchCities).toHaveBeenCalledWith('ки', DeliveryMethod.Courier);
    expect(novaPoshtaService.searchCities).toHaveBeenCalledTimes(2);
  });

  describe('canEstimate', () => {
    it('requires city and warehouse for warehouse method', () => {
      expect(
        service.canEstimate({
          provider: DeliveryProvider.NovaPoshta,
          method: DeliveryMethod.Warehouse,
          city: 'Київ',
          warehouseNumber: '1',
        }),
      ).toBe(true);

      expect(
        service.canEstimate({
          provider: DeliveryProvider.NovaPoshta,
          method: DeliveryMethod.Warehouse,
          city: 'Київ',
        }),
      ).toBe(false);
    });

    it('requires city, street, and building for courier method', () => {
      expect(
        service.canEstimate({
          provider: DeliveryProvider.NovaPoshta,
          method: DeliveryMethod.Courier,
          city: 'Київ',
          street: 'Хрещатик',
          building: '1',
        }),
      ).toBe(true);

      expect(
        service.canEstimate({
          provider: DeliveryProvider.NovaPoshta,
          method: DeliveryMethod.Courier,
          city: 'Київ',
          street: 'Хрещатик',
        }),
      ).toBe(false);
    });

    it('requires only city for custom method', () => {
      expect(
        service.canEstimate({
          provider: DeliveryProvider.Ukrposhta,
          method: DeliveryMethod.Custom,
          city: 'Київ',
        }),
      ).toBe(true);

      expect(
        service.canEstimate({
          provider: DeliveryProvider.Ukrposhta,
          method: DeliveryMethod.Custom,
          city: '  ',
        }),
      ).toBe(false);
    });
  });

  it('estimates warehouse delivery for Nova Poshta', async () => {
    const estimate = await service.estimateFromDelivery(
      {
        provider: DeliveryProvider.NovaPoshta,
        method: DeliveryMethod.Warehouse,
        city: 'Київ',
        warehouseNumber: '1',
      },
      new Date('2025-06-20T10:00:00.000Z'),
      2,
    );

    expect(estimate.estimatedDaysMin).toBe(2);
    expect(estimate.estimatedDaysMax).toBe(4);
    expect(estimate.shippingCostMinor).toBe(9_000);
    expect(estimate.estimatedDeliveryAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('estimates Meest warehouse with the same under-promised day range', async () => {
    const estimate = await service.estimateFromDelivery(
      {
        provider: DeliveryProvider.Meest,
        method: DeliveryMethod.Warehouse,
        city: 'Київ',
        warehouseNumber: '1',
      },
      new Date('2025-06-20T10:00:00.000Z'),
      1,
    );

    expect(estimate.estimatedDaysMin).toBe(2);
    expect(estimate.estimatedDaysMax).toBe(4);
    expect(estimate.shippingCostMinor).toBe(7_000);
  });

  it('estimates Ukrposhta custom with a wider under-promised day range', async () => {
    const estimate = await service.estimateFromDelivery(
      {
        provider: DeliveryProvider.Ukrposhta,
        method: DeliveryMethod.Custom,
        city: 'Київ',
      },
      new Date('2025-06-20T10:00:00.000Z'),
      1,
    );

    expect(estimate.estimatedDaysMin).toBe(3);
    expect(estimate.estimatedDaysMax).toBe(6);
    expect(estimate.shippingCostMinor).toBe(6_500);
  });

  it('returns null when order delivery is incomplete', async () => {
    const estimate = await service.estimateForOrder({
      id: 'order-1',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      items: [{ productId: 'p1', qty: 1 } as never],
      delivery: {
        provider: DeliveryProvider.NovaPoshta,
        method: DeliveryMethod.Warehouse,
        city: 'Київ',
        warehouseNumber: null,
        warehouseRef: null,
      } as never,
    } as never);

    expect(estimate).toBeNull();
  });
});

describe('DeliveryProviderFactory', () => {
  const { factory } = createFactory();

  it('resolves adapters by provider id', () => {
    expect(factory.get(DeliveryProvider.NovaPoshta).provider).toBe(DeliveryProvider.NovaPoshta);
    expect(factory.get(DeliveryProvider.Ukrposhta).provider).toBe(DeliveryProvider.Ukrposhta);
  });
});
