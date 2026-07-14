import { describe, expect, it } from 'vitest';

import { getLocaleLabel, LOCALE_OPTIONS } from '@/i18n/locales';

describe('LOCALE_OPTIONS', () => {
  it('uses native endonyms for supported locales', () => {
    expect(LOCALE_OPTIONS).toEqual([
      { value: 'uk', label: 'Українська' },
      { value: 'en', label: 'English' },
    ]);
  });
});

describe('getLocaleLabel', () => {
  it('returns the native label for a locale', () => {
    expect(getLocaleLabel('en')).toBe('English');
    expect(getLocaleLabel('uk')).toBe('Українська');
  });
});
