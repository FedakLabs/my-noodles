import {
  defaultProductCopy,
  PRODUCT_SEEDS,
  productImages,
  resolveCountrySeed,
  uniqueSlug,
} from '@/infrastructure/seed';

describe('seed-data', () => {
  it('defines sample product seeds', () => {
    expect(PRODUCT_SEEDS.length).toBeGreaterThanOrEqual(60);
    expect(PRODUCT_SEEDS.length).toBeLessThanOrEqual(70);

    const first = PRODUCT_SEEDS[0];
    expect(first).toBeDefined();
    expect(typeof first!.name).toBe('string');
    expect(typeof first!.category).toBe('string');
    expect(typeof first!.brand).toBe('string');
    expect(typeof first!.country).toBe('string');
    expect(first!.priceMinor).toBeGreaterThan(0);
  });

  it('maps known countries to theme keys', () => {
    expect(resolveCountrySeed('South Korea').themeKey).toBe('KR');
  });

  it('creates unique slugs', () => {
    const used = new Set<string>(['pocky']);

    expect(uniqueSlug('Pocky', used)).toBe('pocky-2');
  });

  it('provides colorful product copy', () => {
    const copy = defaultProductCopy(PRODUCT_SEEDS[0]!);

    expect(copy.description.uk).toContain(PRODUCT_SEEDS[0]!.name);
    expect(copy.story.uk).toBeTruthy();
  });

  it('creates deterministic product images', () => {
    const images = productImages(PRODUCT_SEEDS[0]!);

    expect(images).toHaveLength(2);
    expect(images[0]).toContain('https://picsum.photos/seed/');
  });
});
