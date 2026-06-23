import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from './cart-store';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], panelOpen: false, panelOpenNonce: 0 });
  });

  it('adds and merges items by productId', () => {
    const line = {
      productId: '11111111-1111-4111-8111-111111111111',
      slug: 'spicy-noodles',
      title: 'Spicy Noodles',
      priceMinor: 9900,
      currency: 'UAH',
    };

    useCartStore.getState().addItem(line, 1);
    useCartStore.getState().addItem(line, 2);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.qty).toBe(3);
    expect(useCartStore.getState().totalMinor()).toBe(9900 * 3);
  });

  it('updates quantity and removes items at zero', () => {
    const line = {
      productId: '22222222-2222-2222-2222-222222222222',
      slug: 'mochi',
      title: 'Mochi',
      priceMinor: 4500,
      currency: 'UAH',
    };

    useCartStore.getState().addItem(line, 2);
    useCartStore.getState().setQuantity(line.productId, 1);

    expect(useCartStore.getState().items[0]?.qty).toBe(1);

    useCartStore.getState().setQuantity(line.productId, 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('opens the cart panel only when adding to an empty cart', () => {
    const line = {
      productId: '44444444-4444-4444-4444-444444444444',
      slug: 'pocky',
      title: 'Pocky',
      priceMinor: 5500,
      currency: 'UAH',
    };

    useCartStore.getState().addItem(line, 1);
    expect(useCartStore.getState().panelOpen).toBe(true);

    useCartStore.getState().closePanel();
    useCartStore.getState().addItem(line, 1);
    expect(useCartStore.getState().panelOpen).toBe(false);

    useCartStore.getState().clear();
    useCartStore.getState().addItem(line, 1);
    expect(useCartStore.getState().panelOpen).toBe(true);
  });

  it('clears all items', () => {
    useCartStore.getState().addItem({
      productId: '33333333-3333-3333-3333-333333333333',
      slug: 'mochi',
      title: 'Mochi',
      priceMinor: 4500,
      currency: 'UAH',
    });

    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
