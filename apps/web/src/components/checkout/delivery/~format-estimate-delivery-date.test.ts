import { describe, expect, it } from 'vitest';

import { formatEstimateDeliveryDate } from './format-estimate-delivery-date';

describe('formatEstimateDeliveryDate', () => {
  const isoDate = '2026-07-15T12:00:00.000Z';

  it('formats in Ukrainian', () => {
    expect(formatEstimateDeliveryDate(isoDate, 'uk')).toBe('Середа, 15 липня 2026');
  });

  it('formats in English', () => {
    expect(formatEstimateDeliveryDate(isoDate, 'en')).toBe('Wednesday, 15 July 2026');
  });

  it('returns the raw value when parsing fails', () => {
    expect(formatEstimateDeliveryDate('not-a-date', 'uk')).toBe('not-a-date');
  });
});
