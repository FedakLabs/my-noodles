import type { PublicMeestApi } from '@my-noodles/integration-api-clients/meest';

import { extractMeestWarehouseNumber, formatMeestCityName, MeestService } from '@/application/meest';

import { describe, expect, it, jest } from '../jest-globals';

describe('formatMeestCityName', () => {
  it('includes district when region is missing', () => {
    expect(
      formatMeestCityName({
        type: 'село',
        name: 'Іванівка',
        district: 'Кременчуцький',
      }),
    ).toBe('село Іванівка, Кременчуцький');
  });

  it('collapses matching district and region', () => {
    expect(
      formatMeestCityName({
        type: 'м.',
        name: 'Київ',
        district: 'Київ',
        region: 'Київ',
      }),
    ).toBe('м. Київ, Київ');
  });
});

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
    const meestApi = { searchLocalities } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const cities = await service.searchCities('Київ');

    expect(cities).toEqual([{ ref: 'city-1', name: 'м. Київ, Київ' }]);
  });

  it('includes district when region is empty on geo_localities', async () => {
    const searchLocalities = jest.fn().mockResolvedValue([
      {
        n_ua: 'Іванівка',
        t_ua: 'село',
        city_id: 'city-ivanivka',
        reg: '',
        dis: 'Кременчуцький',
      },
    ]);
    const meestApi = { searchLocalities } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const cities = await service.searchCities('Іванівка');

    expect(cities).toEqual([{ ref: 'city-ivanivka', name: 'село Іванівка, Кременчуцький' }]);
  });

  it('uses region already filled by PublicMeestApi.searchLocalities', async () => {
    const searchLocalities = jest.fn().mockResolvedValue([
      {
        n_ua: 'Броварі',
        t_ua: 'село',
        city_id: 'city-brovary',
        reg: 'ТЕРНОПІЛЬСЬКА',
        dis: 'Чортківський',
        d_id: 'district-chortkiv',
      },
    ]);
    const meestApi = { searchLocalities } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const cities = await service.searchCities('Броварі');

    expect(cities).toEqual([{ ref: 'city-brovary', name: 'село Броварі, Чортківський, ТЕРНОПІЛЬСЬКА' }]);
  });

  it('formats warehouse name like Nova Poshta (street in name, city in address)', async () => {
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
    const meestApi = { getBranches } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const warehouses = await service.searchWarehouses('city-1');

    expect(warehouses).toEqual([
      {
        ref: 'branch-1',
        number: '10',
        name: 'Відділення №10: вул. Гребінки, 9/2',
        address: 'Львів, вул. Гребінки, 9/2',
      },
    ]);
  });

  it('reads branch number from num and appends location_description', async () => {
    expect(
      extractMeestWarehouseNumber({
        br_id: '0d161467-ffac-11e8-80d9-1c98ec135261',
        num: 1,
      }),
    ).toBe('1');

    const getBranches = jest.fn().mockResolvedValue([
      {
        br_id: '0d161467-ffac-11e8-80d9-1c98ec135261',
        num: 16,
        type_public: { ua: 'Міні-відділення +' },
        city: { ua: 'Львів' },
        street: { ua: 'вул. Широка' },
        street_number: '83В',
        zip: '79052',
        location_description: 'Rozetka,на касі',
      },
    ]);
    const meestApi = { getBranches } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const warehouses = await service.searchWarehouses('city-1');

    expect(warehouses).toEqual([
      {
        ref: '0d161467-ffac-11e8-80d9-1c98ec135261',
        number: '16',
        name: 'Міні-відділення + №16: вул. Широка, 83В (Rozetka,на касі)',
        address: 'Львів, вул. Широка, 83В',
      },
    ]);
  });

  it('filters warehouses by location_description', async () => {
    const getBranches = jest.fn().mockResolvedValue([
      {
        br_id: 'branch-1',
        num: 200,
        type_public: { ua: 'Міні відділення' },
        city: { ua: 'Львів' },
        street: { ua: 'вул. Сахарова' },
        street_number: '45',
        location_description: 'Тютюнова каса Сільпо',
      },
      {
        br_id: 'branch-2',
        num: 201,
        type_public: { ua: 'Міні відділення' },
        city: { ua: 'Львів' },
        street: { ua: 'вул. Зелена' },
        street_number: '147',
        location_description: 'Rozetka, на касі',
      },
    ]);
    const meestApi = { getBranches } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const warehouses = await service.searchWarehouses('city-1', 'rozetka');

    expect(warehouses).toEqual([
      {
        ref: 'branch-2',
        number: '201',
        name: 'Міні відділення №201: вул. Зелена, 147 (Rozetka, на касі)',
        address: 'Львів, вул. Зелена, 147',
      },
    ]);
  });

  it('translates Latin city query to Cyrillic before calling the API', async () => {
    const searchLocalities = jest.fn().mockResolvedValue([
      {
        n_ua: 'Київ',
        t_ua: 'м.',
        city_id: 'city-1',
        reg: 'Київ',
        dis: 'Київ',
      },
    ]);
    const meestApi = { searchLocalities } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const cities = await service.searchCities('Kyiv');

    expect(searchLocalities).toHaveBeenCalledWith('Київ');
    expect(cities).toEqual([{ ref: 'city-1', name: 'м. Київ, Київ' }]);
  });

  it('always prefers Ukrainian branch labels', async () => {
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
    const meestApi = { getBranches } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const warehouses = await service.searchWarehouses('city-1');

    expect(warehouses).toEqual([
      {
        ref: 'branch-1',
        number: '10',
        name: 'Відділення №10: вул. Гребінки, 9/2',
        address: 'Львів, вул. Гребінки, 9/2',
      },
    ]);
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
    const meestApi = { getBranches } as unknown as PublicMeestApi;

    const service = new MeestService(meestApi);
    const warehouses = await service.searchWarehouses('city-1', 'Гребінки');

    expect(warehouses).toEqual([
      {
        ref: 'branch-1',
        number: '10',
        name: 'Відділення №10: вул. Гребінки',
        address: 'Львів, вул. Гребінки',
      },
    ]);
  });
});
