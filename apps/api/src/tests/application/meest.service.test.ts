import type { MeestApi } from '@my-noodles/api-clients/meest';
import { LocaleContext } from '@my-noodles/api-lib/locale';

import { MeestService } from '@/application/meest';

import { describe, expect, it, jest } from '../jest-globals';

describe('MeestService', () => {
  it('formats city name with type, district, and region', async () => {
    const searchLocalities = jest.fn().mockResolvedValue([
      {
        n_ua: 'Київ',
        t_ua: 'м.',
        city_id: 'city-1',
        reg: 'Київ',
        dis: 'Київ',
      },
    ]);
    const meestApi = { searchLocalities } as unknown as MeestApi;

    const service = new MeestService(meestApi);
    const cities = await service.searchCities('Київ');

    expect(cities).toEqual([{ ref: 'city-1', name: 'м. Київ, Київ' }]);
  });

  it('formats warehouse name and address from branch fields', async () => {
    const getBranches = jest.fn().mockResolvedValue([
      {
        br_id: 'branch-1',
        num_showcase: 10,
        type_public: { ua: 'Відділення' },
        city: { ua: 'Львів' },
        street: { ua: 'вул. Гребінки' },
        street_number: '9/2',
        zip: '79007',
      },
    ]);
    const meestApi = { getBranches } as unknown as MeestApi;

    const service = new MeestService(meestApi);
    const warehouses = await service.searchWarehouses('city-1');

    expect(warehouses).toEqual([
      {
        ref: 'branch-1',
        number: '10',
        name: 'Відділення №10, Львів',
        address: 'вул. Гребінки, 9/2, Львів, 79007',
      },
    ]);
  });

  it('prefers English branch labels when locale is en', async () => {
    await LocaleContext.run('en', async () => {
      const getBranches = jest.fn().mockResolvedValue([
        {
          br_id: 'branch-1',
          num_showcase: 10,
          type_public: { ua: 'Відділення', en: 'Branch' },
          city: { ua: 'Львів', en: 'Lviv' },
          street: { ua: 'вул. Гребінки', en: 'Hrebinky st.' },
          street_number: '9/2',
          zip: '79007',
        },
      ]);
      const meestApi = { getBranches } as unknown as MeestApi;

      const service = new MeestService(meestApi);
      const warehouses = await service.searchWarehouses('city-1');

      expect(warehouses).toEqual([
        {
          ref: 'branch-1',
          number: '10',
          name: 'Branch №10, Lviv',
          address: 'Hrebinky st., 9/2, Lviv, 79007',
        },
      ]);
    });
  });

  it('filters warehouses by query across localized fields', async () => {
    const getBranches = jest.fn().mockResolvedValue([
      {
        br_id: 'branch-1',
        num_showcase: 10,
        type_public: { ua: 'Відділення' },
        city: { ua: 'Львів' },
        street: { ua: 'вул. Гребінки' },
      },
      {
        br_id: 'branch-2',
        num_showcase: 20,
        type_public: { ua: 'Поштомат' },
        city: { ua: 'Львів' },
        street: { ua: 'вул. Шевченка' },
      },
    ]);
    const meestApi = { getBranches } as unknown as MeestApi;

    const service = new MeestService(meestApi);
    const warehouses = await service.searchWarehouses('city-1', 'Гребінки');

    expect(warehouses).toEqual([
      {
        ref: 'branch-1',
        number: '10',
        name: 'Відділення №10, Львів',
        address: 'вул. Гребінки, Львів',
      },
    ]);
  });
});
