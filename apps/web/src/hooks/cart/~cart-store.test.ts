import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from './cart-store';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('adds and merges items by productId', () => {
    const line = {
      productId: '11111111-1111-1111-1111-111111111111',
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

  it('clears items on migrate bump semantics via empty state reset', () => {
    useCartStore.getState().addItem({
      productId: '22222222-2222-2222-2222-222222222222',
      slug: 'mochi',
      title: 'Mochi',
      priceMinor: 4500,
      currency: 'UAH',
    });

    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
