import type { NovaPoshtaApi } from '@my-noodles/integration-api-clients/nova-poshta';

import { NovaPoshtaException, NovaPoshtaService } from '@/application/nova-poshta';
import { DeliveryMethod } from '@/application/orders/order-delivery.dto';

import { describe, expect, it, jest } from '../jest-globals';

describe('NovaPoshtaService', () => {
  it('uses getCities for warehouse method when matches are found', async () => {
    const getCities = jest.fn().mockResolvedValue([
      {
        Ref: 'city-ref',
        Description: 'Київ',
        SettlementTypeDescription: 'м.',
        RegionsDescription: 'Київська',
        AreaDescription: 'Київська область',
      },
    ]);
    const searchSettlements = jest.fn();
    const novaPoshtaApi = {
      getCities,
      searchSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київ', DeliveryMethod.Warehouse);

    expect(cities).toEqual([{ ref: 'city-ref', name: 'м. Київ, Київська, Київська область' }]);
    expect(getCities).toHaveBeenCalledWith('Київ');
    expect(searchSettlements).not.toHaveBeenCalled();
  });

  it('falls back to searchSettlements DeliveryCity for warehouse when getCities is empty', async () => {
    const getCities = jest.fn().mockResolvedValue([]);
    const searchSettlements = jest.fn().mockResolvedValue([
      {
        Addresses: [
          {
            Ref: 'settlement-ref',
            Present: 'м. Київ, Київська обл.',
            DeliveryCity: 'delivery-city-ref',
            MainDescription: 'Київ',
            SettlementTypeCode: 'м.',
            Area: 'Київська',
            Region: 'Київський',
          },
        ],
      },
    ]);
    const novaPoshtaApi = {
      getCities,
      searchSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київ', DeliveryMethod.Warehouse);

    expect(cities).toEqual([{ ref: 'delivery-city-ref', name: 'м. Київ, Київський, Київська' }]);
    expect(searchSettlements).toHaveBeenCalledWith('Київ');
  });

  it('uses settlement Ref for courier method', async () => {
    const getCities = jest.fn();
    const searchSettlements = jest.fn().mockResolvedValue([
      {
        Addresses: [
          {
            Ref: 'settlement-ref',
            Present: 'с. Київка, Голопристанський р-н, Херсонська обл.',
            DeliveryCity: 'delivery-city-ref',
            MainDescription: 'Київка',
            SettlementTypeCode: 'с.',
            Area: 'Херсонська',
            Region: 'Голопристанський',
          },
        ],
      },
    ]);
    const novaPoshtaApi = {
      getCities,
      searchSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київка', DeliveryMethod.Courier);

    expect(cities).toEqual([{ ref: 'settlement-ref', name: 'с. Київка, Голопристанський, Херсонська' }]);
    expect(searchSettlements).toHaveBeenCalledWith('Київка');
    expect(getCities).not.toHaveBeenCalled();
  });

  it('falls back to Present when settlement structured fields are missing', async () => {
    const getCities = jest.fn();
    const searchSettlements = jest.fn().mockResolvedValue([
      {
        Addresses: [
          {
            Ref: 'settlement-ref',
            Present: 'село Івано-Благодатне',
            DeliveryCity: 'delivery-city-ref',
          },
        ],
      },
    ]);
    const novaPoshtaApi = {
      getCities,
      searchSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Івано', DeliveryMethod.Courier);

    expect(cities).toEqual([{ ref: 'settlement-ref', name: 'село Івано-Благодатне' }]);
  });

  it('translates Latin city query to Cyrillic before calling the API', async () => {
    const getCities = jest.fn().mockResolvedValue([
      {
        Ref: 'city-ref',
        Description: 'Київ',
        SettlementTypeDescription: 'м.',
      },
    ]);
    const novaPoshtaApi = {
      getCities,
      searchSettlements: jest.fn(),
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Kyiv', DeliveryMethod.Warehouse);

    expect(getCities).toHaveBeenCalledWith('Київ');
    expect(cities).toEqual([{ ref: 'city-ref', name: 'м. Київ' }]);
  });

  it('returns empty cities when NP rejects the search query', async () => {
    const getCities = jest.fn().mockRejectedValue(new Error('FindByString is not specified'));
    const novaPoshtaApi = {
      getCities,
      searchSettlements: jest.fn(),
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('xyz', DeliveryMethod.Warehouse);

    expect(cities).toEqual([]);
  });

  it('rethrows NovaPoshtaException for non-query city search failures', async () => {
    const getCities = jest.fn().mockRejectedValue(new Error('API key is invalid'));
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
      payload: { reason: 'API key is invalid' },
    });
  });

  it('maps warehouses from a single getWarehouses call', async () => {
    const getWarehouses = jest.fn().mockResolvedValue([
      {
        Ref: 'branch-ref',
        Number: '1',
        Description: 'Відділення №1',
        ShortAddress: 'Київ, вул. Хрещатик, 1',
      },
      {
        Ref: 'postomat-ref',
        Number: '5001',
        Description: 'Поштомат «Нова Пошта» №5001',
        ShortAddress: 'Київ, вул. Саксаганського, 1',
        CategoryOfWarehouse: 'Postomat',
      },
    ]);
    const novaPoshtaApi = {
      getWarehouses,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const warehouses = await service.searchWarehouses('city-ref', '1');

    expect(getWarehouses).toHaveBeenCalledTimes(1);
    expect(getWarehouses).toHaveBeenCalledWith('city-ref', '1');
    expect(warehouses).toEqual([
      {
        ref: 'branch-ref',
        number: '1',
        name: 'Відділення №1',
        address: 'Київ, вул. Хрещатик, 1',
      },
      {
        ref: 'postomat-ref',
        number: '5001',
        name: 'Поштомат «Нова Пошта» №5001',
        address: 'Київ, вул. Саксаганського, 1',
      },
    ]);
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
