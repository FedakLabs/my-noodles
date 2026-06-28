import { DeliveryService } from '@/application/delivery/delivery.service';
import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';
import { DeliveryCatalogCache } from '@/application/delivery/delivery-catalog.cache';
import { DeliveryProviderFactory } from '@/application/delivery/providers/delivery-provider.factory';
import { MeestDeliveryAdapter } from '@/application/delivery/providers/meest.adapter';
import { NovaPoshtaDeliveryAdapter } from '@/application/delivery/providers/nova-poshta.adapter';
import { UkrposhtaDeliveryAdapter } from '@/application/delivery/providers/ukrposhta.adapter';
import { DeliveryMethod, DeliveryProvider } from '@/application/orders';

import { describe, expect, it, jest } from '../jest-globals';

describe('DeliveryService', () => {
  const factory = new DeliveryProviderFactory(
    new NovaPoshtaDeliveryAdapter({ isConfigured: () => false } as never),
    new MeestDeliveryAdapter({ isConfigured: () => false } as never),
    new UkrposhtaDeliveryAdapter({ isConfigured: () => false } as never),
  );
  const cache = new DeliveryCatalogCache();
  const service = new DeliveryService(factory, cache, { warn: jest.fn(), error: jest.fn() } as never);

  it('lists all delivery providers', () => {
    const providers = service.listProviders();

    expect(providers).toEqual([
      { id: DeliveryProvider.NovaPoshta, label: 'Нова Пошта' },
      { id: DeliveryProvider.Meest, label: 'Meest' },
      { id: DeliveryProvider.Ukrposhta, label: 'Укрпошта' },
    ]);
  });

  it('returns popular stub cities without query', async () => {
    const cities = await service.searchCities(DeliveryProvider.NovaPoshta);

    expect(cities).toHaveLength(5);
    expect(cities[0]?.name).toBe('Київ');
  });

  it('searches stub cities by query', async () => {
    const cities: DeliveryCity[] = await service.searchCities(DeliveryProvider.NovaPoshta, 'ки');

    expect(cities.some((city) => city.name === 'Київ')).toBe(true);
  });

  it('returns stub warehouses for a city ref', async () => {
    const warehouses: DeliveryWarehouse[] = await service.searchWarehouses(
      DeliveryProvider.Meest,
      'city-kyiv',
    );

    expect(warehouses.length).toBeGreaterThan(0);
    expect(warehouses[0]?.ref).toMatch(/^wh-kyiv-/);
  });

  it('serves catalog results from cache on repeated city search', async () => {
    const localCache = new DeliveryCatalogCache();
    const localService = new DeliveryService(factory, localCache, {
      warn: jest.fn(),
      error: jest.fn(),
    } as never);
    const adapter = factory.get(DeliveryProvider.NovaPoshta);
    const searchCities = jest.spyOn(adapter, 'searchCities');

    await localService.searchCities(DeliveryProvider.NovaPoshta, 'lv');
    await localService.searchCities(DeliveryProvider.NovaPoshta, 'lv');

    expect(searchCities).toHaveBeenCalledTimes(1);
    searchCities.mockRestore();
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
    expect(estimate.estimatedDaysMax).toBe(3);
    expect(estimate.shippingCostMinor).toBe(6_500);
    expect(estimate.estimatedDeliveryAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('adds extra days for Meest warehouse delivery', async () => {
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

    expect(estimate.estimatedDaysMin).toBe(3);
    expect(estimate.estimatedDaysMax).toBe(4);
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
  const factory = new DeliveryProviderFactory(
    new NovaPoshtaDeliveryAdapter({ isConfigured: () => false } as never),
    new MeestDeliveryAdapter({ isConfigured: () => false } as never),
    new UkrposhtaDeliveryAdapter({ isConfigured: () => false } as never),
  );

  it('resolves adapters by provider id', () => {
    expect(factory.get(DeliveryProvider.NovaPoshta).provider).toBe(DeliveryProvider.NovaPoshta);
    expect(factory.get(DeliveryProvider.Ukrposhta).provider).toBe(DeliveryProvider.Ukrposhta);
  });
});
