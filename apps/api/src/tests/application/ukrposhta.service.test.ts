import { extractUkrposhtaWarehouseNumber, formatUkrposhtaCityName } from '@/application/ukrposhta';

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

  it('extracts warehouse number from PO_SHORT when available', () => {
    expect(
      extractUkrposhtaWarehouseNumber({
        ID: '2699',
        PO_SHORT: 'Київ 10',
        POSTINDEX: '01010',
      }),
    ).toBe('10');
  });
});
