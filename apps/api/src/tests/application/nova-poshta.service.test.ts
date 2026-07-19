import type { NovaPoshtaApi } from '@my-noodles/integration-api-clients/nova-poshta';

import {
  formatNovaPoshtaDirectoryCityName,
  NovaPoshtaException,
  NovaPoshtaService,
} from '@/application/nova-poshta';
import { DeliveryMethod } from '@/application/orders/order-delivery.dto';

import { describe, expect, it, jest } from '../jest-globals';

describe('NovaPoshtaService', () => {
  it('formats directory city name with type and region', () => {
    expect(
      formatNovaPoshtaDirectoryCityName({
        Ref: 'city-ref',
        Description: 'Київ',
        SettlementTypeDescription: 'м.',
        RegionsDescription: 'Київська',
        AreaDescription: 'Київська область',
      }),
    ).toBe('м. Київ, Київська область, Київська');
  });

  it('uses getCities for warehouse method when matches are found', async () => {
    const getCities = jest.fn().mockResolvedValue([
      {
        Ref: 'city-ref',
        Description: 'Київ',
        SettlementTypeDescription: 'м.',
        RegionsDescription: 'Київська',
      },
    ]);
    const searchSettlements = jest.fn();
    const novaPoshtaApi = {
      getCities,
      searchSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київ', DeliveryMethod.Warehouse);

    expect(cities).toEqual([{ ref: 'city-ref', name: 'м. Київ, Київська' }]);
    expect(getCities).toHaveBeenCalledWith('Київ');
    expect(searchSettlements).not.toHaveBeenCalled();
  });

  it('falls back to searchSettlements DeliveryCity for warehouse when getCities is empty', async () => {
    const getCities = jest.fn().mockResolvedValue([]);
    const searchSettlements = jest.fn().mockResolvedValue([
      {
        Addresses: [
          { Ref: 'settlement-ref', Present: 'м. Київ, Київська обл.', DeliveryCity: 'delivery-city-ref' },
        ],
      },
    ]);
    const novaPoshtaApi = {
      getCities,
      searchSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київ', DeliveryMethod.Warehouse);

    expect(cities).toEqual([{ ref: 'delivery-city-ref', name: 'м. Київ, Київська обл.' }]);
    expect(searchSettlements).toHaveBeenCalledWith('Київ');
  });

  it('uses settlement Ref for courier method', async () => {
    const getCities = jest.fn();
    const searchSettlements = jest.fn().mockResolvedValue([
      {
        Addresses: [
          { Ref: 'settlement-ref', Present: 'м. Київ, Київська обл.', DeliveryCity: 'delivery-city-ref' },
        ],
      },
    ]);
    const novaPoshtaApi = {
      getCities,
      searchSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київ', DeliveryMethod.Courier);

    expect(cities).toEqual([{ ref: 'settlement-ref', name: 'м. Київ, Київська обл.' }]);
    expect(searchSettlements).toHaveBeenCalledWith('Київ');
    expect(getCities).not.toHaveBeenCalled();
  });

  it('rethrows NovaPoshtaException when city search fails', async () => {
    const getCities = jest.fn().mockRejectedValue(new Error('CityName has invalid characters'));
    const novaPoshtaApi = {
      getCities,
      searchSettlements: jest.fn(),
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const error = await service.searchCities('Київ', DeliveryMethod.Warehouse).catch((err) => err);

    expect(error).toBeInstanceOf(NovaPoshtaException);
    expect(error).toMatchObject({
      code: 'nova_poshta_error',
      message: 'Nova Poshta request failed',
      payload: { reason: 'CityName has invalid characters' },
    });
  });

  it('rethrows NovaPoshtaException when warehouse search fails', async () => {
    const getWarehouses = jest.fn().mockRejectedValue(new Error('CityRef is empty'));
    const novaPoshtaApi = {
      getWarehouses,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const error = await service.searchWarehouses('city-ref').catch((err) => err);

    expect(error).toBeInstanceOf(NovaPoshtaException);
    expect(error).toMatchObject({
      code: 'nova_poshta_error',
      payload: { reason: 'CityRef is empty' },
    });
  });
});
