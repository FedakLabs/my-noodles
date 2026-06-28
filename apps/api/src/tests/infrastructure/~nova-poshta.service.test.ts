import {
  formatNovaPoshtaDirectoryCityName,
  NovaPoshtaService,
} from '@/infrastructure/external-apis/nova-poshta';
import type { NovaPoshtaApi } from '@/infrastructure/external-apis/nova-poshta/nova-poshta.api';

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

  it('uses getCities when api key is configured', async () => {
    const getCities = jest.fn().mockResolvedValue([
      {
        Ref: 'city-ref',
        Description: 'Київ',
        SettlementTypeDescription: 'м.',
        RegionsDescription: 'Київська',
      },
    ]);
    const searchSettlements = jest.fn();
    const getSettlements = jest.fn();
    const novaPoshtaApi = {
      hasApiKey: () => true,
      isConfigured: () => true,
      getCities,
      searchSettlements,
      getSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київ');

    expect(cities).toEqual([{ ref: 'city-ref', name: 'м. Київ, Київська' }]);
    expect(getCities).toHaveBeenCalledWith('Київ');
    expect(searchSettlements).not.toHaveBeenCalled();
  });

  it('falls back to searchSettlements when getCities returns no matches', async () => {
    const getCities = jest.fn().mockResolvedValue([]);
    const searchSettlements = jest.fn().mockResolvedValue([
      {
        Addresses: [{ Present: 'м. Київ, Київська обл.', DeliveryCity: 'delivery-city-ref' }],
      },
    ]);
    const getSettlements = jest.fn();
    const novaPoshtaApi = {
      hasApiKey: () => true,
      isConfigured: () => true,
      getCities,
      searchSettlements,
      getSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Київ');

    expect(cities).toEqual([{ ref: 'delivery-city-ref', name: 'м. Київ, Київська обл.' }]);
    expect(searchSettlements).toHaveBeenCalledWith('Київ');
  });

  it('uses getSettlements when api key is not configured', async () => {
    const getCities = jest.fn();
    const searchSettlements = jest.fn();
    const getSettlements = jest
      .fn()
      .mockResolvedValue([{ Ref: 'city-ref', Description: 'Львів', SettlementTypeDescription: 'м.' }]);
    const novaPoshtaApi = {
      hasApiKey: () => false,
      isConfigured: () => true,
      getCities,
      searchSettlements,
      getSettlements,
    } as unknown as NovaPoshtaApi;

    const service = new NovaPoshtaService(novaPoshtaApi);
    const cities = await service.searchCities('Льв');

    expect(cities).toEqual([{ ref: 'city-ref', name: 'м. Львів' }]);
    expect(getCities).not.toHaveBeenCalled();
    expect(searchSettlements).not.toHaveBeenCalled();
  });
});
