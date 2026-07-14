import { describe, expect, it } from 'vitest';

import { absoluteUrl, buildHreflangAlternates, localePath } from './urls';

describe('seo urls', () => {
  it('builds locale-prefixed paths', () => {
    expect(localePath('uk')).toBe('/uk');
    expect(localePath('en', '/catalog')).toBe('/en/catalog');
  });

  it('builds absolute urls from the configured site origin', () => {
    expect(absoluteUrl('/uk/catalog')).toBe('http://localhost:3000/uk/catalog');
  });

  it('includes x-default hreflang for the default locale', () => {
    expect(buildHreflangAlternates('/catalog')).toEqual({
      uk: 'http://localhost:3000/uk/catalog',
      en: 'http://localhost:3000/en/catalog',
      'x-default': 'http://localhost:3000/uk/catalog',
    });
  });
});
