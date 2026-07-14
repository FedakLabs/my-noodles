import { describe, expect, it } from 'vitest';

import { cartLineToGa4Item, priceMinorToMajor, productToGa4Item } from './ecommerce';

describe('priceMinorToMajor', () => {
  it('converts kopiyky to hryvnia with two decimals', () => {
    expect(priceMinorToMajor(12_350)).toBe(123.5);
    expect(priceMinorToMajor(99)).toBe(0.99);
  });
});

describe('productToGa4Item', () => {
  it('maps product fields for GA4 ecommerce', () => {
    expect(
      productToGa4Item(
        {
          slug: 'samyang-buldak',
          name: 'Samyang Buldak',
          priceMinor: 15_900,
          brand: { slug: 'samyang', name: 'Samyang' },
          category: { slug: 'instant-noodles', name: 'Instant noodles' },
        },
        2,
      ),
    ).toEqual({
      item_id: 'samyang-buldak',
      item_name: 'Samyang Buldak',
      price: 159,
      quantity: 2,
      item_category: 'instant-noodles',
      item_brand: 'samyang',
    });
  });
});

describe('cartLineToGa4Item', () => {
  it('maps cart line fields for GA4 ecommerce', () => {
    expect(
      cartLineToGa4Item({
        slug: 'kitkat-matcha',
        title: 'KitKat Matcha',
        priceMinor: 8_500,
        qty: 3,
      }),
    ).toEqual({
      item_id: 'kitkat-matcha',
      item_name: 'KitKat Matcha',
      price: 85,
      quantity: 3,
    });
  });
});
