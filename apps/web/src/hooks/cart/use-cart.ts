'use client';

import { useCartStore } from './cart-store';

export function useCartItems() {
  return useCartStore((state) => state.items);
}

export function useCartItemCount() {
  return useCartStore((state) => state.itemCount());
}

export function useCartTotalMinor() {
  return useCartStore((state) => state.totalMinor());
}

export function useCartPanelOpen() {
  return useCartStore((state) => state.panelOpen);
}

export function useCartPanelOpenNonce() {
  return useCartStore((state) => state.panelOpenNonce);
}

export function useCartActions() {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clear = useCartStore((state) => state.clear);
  const openPanel = useCartStore((state) => state.openPanel);
  const closePanel = useCartStore((state) => state.closePanel);
  const beginCheckout = useCartStore((state) => state.beginCheckout);

  return { addItem, removeItem, setQuantity, clear, openPanel, closePanel, beginCheckout };
}
