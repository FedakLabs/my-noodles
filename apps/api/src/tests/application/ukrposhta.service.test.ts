import { LocaleContext } from '@my-noodles/api-lib/locale';

import {
  extractUkrposhtaWarehouseNumber,
  formatUkrposhtaCityName,
  formatUkrposhtaWarehouseAddress,
} from '@/application/ukrposhta';

import { describe, expect, it } from '../jest-globals';

describe('UkrposhtaService mapping', () => {
  it('formats city name with type and region', () => {
    expect(
      formatUkrposhtaCityName({
        CITY_ID: '29713',
        CITY_UA: 'Київ',
        SHORTCITYTYPE_UA: 'м.',
        REGION_UA: 'Київ',
        DISTRICT_UA: 'Київ',
      }),
    ).toBe('м. Київ, Київ');
  });

  it('prefers English city labels when locale is en', () => {
    LocaleContext.run('en', () => {
      expect(
        formatUkrposhtaCityName({
          CITY_ID: '10952',
          CITY_UA: 'Бровари',
          CITY_EN: 'Brovary',
          SHORTCITYTYPE_UA: 'м.',
          REGION_UA: 'Київська',
          REGION_EN: 'Kyivska',
          DISTRICT_UA: 'Броварський',
          DISTRICT_EN: 'BROVARSKYI',
        }),
      ).toBe('м. Brovary, BROVARSKYI, Kyivska');
    });
  });

  it('extracts warehouse number from POSTCODE', () => {
    expect(
      extractUkrposhtaWarehouseNumber({
        POSTOFFICE_ID: '2738',
        POSTOFFICE_UA: '07400 Бровари',
        POSTCODE: '07400',
      }),
    ).toBe('07400');
  });

  it('formats warehouse address from street and house number', () => {
    expect(
      formatUkrposhtaWarehouseAddress({
        POSTOFFICE_ID: '2738',
        STREET_UA_VPZ: 'вул. Героїв України',
        HOUSENUMBER: '20',
      }),
    ).toBe('вул. Героїв України, 20');
  });
});
