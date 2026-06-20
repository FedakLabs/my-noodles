import { defaultProductCopy, PRODUCT_SEEDS, resolveCountrySeed, uniqueSlug } from '@/infrastructure/seed';

describe('seed-data', () => {
  it('defines sample product seeds', () => {
    expect(PRODUCT_SEEDS.length).toBeGreaterThan(0);

    const first = PRODUCT_SEEDS[0];
    expect(first).toBeDefined();
    expect(typeof first!.name).toBe('string');
    expect(typeof first!.category).toBe('string');
    expect(typeof first!.brand).toBe('string');
    expect(typeof first!.country).toBe('string');
  });

  it('maps known countries to theme keys', () => {
    expect(resolveCountrySeed('South Korea').themeKey).toBe('KR');
  });

  it('creates unique slugs', () => {
    const used = new Set<string>(['pocky']);

    expect(uniqueSlug('Pocky', used)).toBe('pocky-2');
  });

  it('provides placeholder copy', () => {
    const copy = defaultProductCopy('Pocky');

    expect(copy.description.uk).toContain('Pocky');
    expect(copy.story.uk).toBeTruthy();
  });
});
