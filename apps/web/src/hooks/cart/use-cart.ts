'use client';

import { useCallback } from 'react';

import type { CartLineInput } from '@/api/cart';
import { useAddCartItem, useCartQuery, useClearCart, useRemoveCartItem, useSetCartItemQty } from '@/api/cart';

import { useCartStore } from './cart-store';

export type CartLine = CartLineInput & { qty: number };

export function useCartItems(): CartLine[] {
  const { cart } = useCartQuery();
  return cart?.items ?? [];
}

export function useCartItemCount() {
  const { cart } = useCartQuery();
  return cart?.itemCount ?? 0;
}

export function useCartTotalMinor() {
  const { cart } = useCartQuery();
  return cart?.totalMinor ?? 0;
}

export function useCartPanelOpen() {
  return useCartStore((state) => state.panelOpen);
}

export function useCartPanelOpenNonce() {
  return useCartStore((state) => state.panelOpenNonce);
}

export function useCartActions() {
  const { addCartItem, addCartItemIsAddingProduct } = useAddCartItem();
  const { setCartItemQty, setCartItemQtyIsPending, setCartItemQtyVariables } = useSetCartItemQty();
  const { removeCartItem, removeCartItemIsPending, removeCartItemVariables } = useRemoveCartItem();
  const { clearCart, clearCartIsPending } = useClearCart();
  const openPanel = useCartStore((state) => state.openPanel);
  const closePanel = useCartStore((state) => state.closePanel);
  const beginCheckout = useCartStore((state) => state.beginCheckout);

  const isAddingProduct = addCartItemIsAddingProduct;

  const isUpdatingProduct = useCallback(
    (productId: string) => setCartItemQtyIsPending && setCartItemQtyVariables?.productId === productId,
    [setCartItemQtyIsPending, setCartItemQtyVariables?.productId],
  );

  const isRemovingProduct = useCallback(
    (productId: string) => removeCartItemIsPending && removeCartItemVariables?.productId === productId,
    [removeCartItemIsPending, removeCartItemVariables?.productId],
  );

  return {
    addItem: (line: Omit<CartLine, 'qty'>, qty = 1) => {
      addCartItem({ ...line, qty });
    },
    removeItem: (productId: string, analyticsLine?: CartLine) => {
      removeCartItem({ productId, analyticsLine });
    },
    setQuantity: (productId: string, qty: number, analyticsLine?: CartLine) => {
      setCartItemQty({ productId, qty, analyticsLine });
    },
    clearCart: () => {
      clearCart();
    },
    clearCartIsPending,
    isAddingProduct,
    isUpdatingProduct,
    isRemovingProduct,
    openPanel,
    closePanel,
    beginCheckout,
  };
}
