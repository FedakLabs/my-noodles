import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from './cart-store';

describe('cart-store', () => {
  beforeEach(() => {
    useCartStore.setState({ panelOpen: false, panelOpenNonce: 0 });
  });

  it('opens the panel on first add when cart was empty', () => {
    useCartStore.getState().openPanelIfFirstAdd(true);

    expect(useCartStore.getState().panelOpen).toBe(true);
    expect(useCartStore.getState().panelOpenNonce).toBe(1);
  });

  it('does not reopen the panel when items were already in cart', () => {
    useCartStore.getState().openPanelIfFirstAdd(false);

    expect(useCartStore.getState().panelOpen).toBe(false);
  });

  it('increments panelOpenNonce each time the panel opens from closed', () => {
    useCartStore.getState().openPanel();
    useCartStore.getState().closePanel();
    useCartStore.getState().openPanel();

    expect(useCartStore.getState().panelOpenNonce).toBe(2);
  });

  it('closes the panel when checkout begins', () => {
    useCartStore.getState().openPanel();
    useCartStore.getState().beginCheckout();

    expect(useCartStore.getState().panelOpen).toBe(false);
  });
});
