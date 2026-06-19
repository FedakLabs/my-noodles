import { describe, expect, it } from 'vitest';

import { brandSkins, categorySkins, countrySkins } from './registry';
import { resolveSkin } from './resolveSkin';

describe('resolveSkin', () => {
  it('resolves registered country skin', () => {
    const result = resolveSkin({ country: 'kr' });

    expect(result.source).toBe('country');
    expect(result.key).toBe('KR');
    expect(result.definition?.accent).toBe(countrySkins.KR?.accent);
    expect(result.cssVars['--colors-button-fill-primary']).toBe(countrySkins.KR?.accent);
  });

  it('falls through unknown brand to country', () => {
    const result = resolveSkin({ brand: 'unknown-brand', country: 'TH' });

    expect(result.source).toBe('country');
    expect(result.key).toBe('TH');
  });

  it('resolves registered brand skin before country', () => {
    const result = resolveSkin({ brand: 'buldak', country: 'KR' });

    expect(result.source).toBe('brand');
    expect(result.key).toBe('BULDAK');
    expect(result.definition?.accent).toBe(brandSkins.BULDAK?.accent);
  });

  it('resolves registered category skin when brand and country miss', () => {
    const result = resolveSkin({
      brand: 'unknown',
      country: 'ZZ',
      category: 'sweets',
    });

    expect(result.source).toBe('category');
    expect(result.key).toBe('SWEETS');
    expect(result.definition?.accent).toBe(categorySkins.SWEETS?.accent);
  });

  it('falls through unknown country and category to hash slug', () => {
    const result = resolveSkin({
      country: 'ZZ',
      category: 'unknown',
      slug: 'spicy-noodles',
    });

    expect(result.source).toBe('hash');
    expect(result.key).toBe('spicy-noodles');
    expect(result.definition?.bgHueBrand).toBeGreaterThanOrEqual(0);
    expect(result.definition?.bgHueBrand).toBeLessThan(360);
  });

  it('returns stable hash for the same slug', () => {
    const first = resolveSkin({ slug: 'mochi-classic' });
    const second = resolveSkin({ slug: 'mochi-classic' });

    expect(first.cssVars).toEqual(second.cssVars);
  });

  it('returns base theme when no keys match', () => {
    const result = resolveSkin({});

    expect(result.source).toBe('base');
    expect(result.key).toBe('base');
    expect(result.definition).toBeNull();
    expect(result.cssVars['--colors-surface-page']).toBe('#FBF7F2');
  });

  it('registers all MVP country codes', () => {
    for (const code of ['CN', 'KR', 'TH', 'US', 'CA', 'TW']) {
      const result = resolveSkin({ country: code });
      expect(result.source).toBe('country');
      expect(result.key).toBe(code);
    }
  });
});
