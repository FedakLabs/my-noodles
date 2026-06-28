import {
  formatMeestCityName,
  formatMeestWarehouseAddress,
  formatMeestWarehouseName,
} from '@/infrastructure/external-apis/meest';

import { describe, expect, it } from '../jest-globals';

describe('MeestService mapping', () => {
  it('formats city name with type, district, and region', () => {
    expect(
      formatMeestCityName({
        n_ua: 'Київ',
        t_ua: 'м.',
        city_id: 'city-1',
        reg: 'Київ',
        dis: 'Київ',
      }),
    ).toBe('м. Київ, Київ');
  });

  it('formats warehouse name and address from branch fields', () => {
    const branch = {
      br_id: 'branch-1',
      num_showcase: 10,
      type_public: { ua: 'Відділення' },
      city: { ua: 'Львів' },
      street: { ua: 'вул. Гребінки' },
      street_number: '9/2',
      zip: '79007',
    };

    expect(formatMeestWarehouseName(branch)).toBe('Відділення №10, Львів');
    expect(formatMeestWarehouseAddress(branch)).toBe('вул. Гребінки, 9/2, Львів, 79007');
  });
});
