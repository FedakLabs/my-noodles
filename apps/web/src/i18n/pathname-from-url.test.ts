import { describe, expect, it } from 'vitest';

import { pathnameFromUrl } from './pathname-from-url';

function url(pathname: string, search = '', hash = ''): URL {
  return new URL(`http://localhost:3000${pathname}${search}${hash}`);
}

describe('pathnameFromUrl', () => {
  it('strips a known locale prefix', () => {
    expect(pathnameFromUrl(url('/uk/catalog'))).toBe('/catalog');
    expect(pathnameFromUrl(url('/en/product/pocky'))).toBe('/product/pocky');
  });

  it('returns / for locale-only paths', () => {
    expect(pathnameFromUrl(url('/uk'))).toBe('/');
    expect(pathnameFromUrl(url('/en/'))).toBe('/');
  });

  it('leaves paths without a locale segment unchanged', () => {
    expect(pathnameFromUrl(url('/catalog'))).toBe('/catalog');
    expect(pathnameFromUrl(url('/'))).toBe('/');
  });

  it('does not treat unknown first segments as locales', () => {
    expect(pathnameFromUrl(url('/catalog/uk'))).toBe('/catalog/uk');
  });

  it('ignores search and hash', () => {
    expect(pathnameFromUrl(url('/uk/catalog', '?sort=popular', '#top'))).toBe('/catalog');
  });
});
