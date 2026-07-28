'use client';

import type { CartLineInput } from '@/api/cart';
import {
  useAddCartItem,
  useAddCartItemsBatch,
  useCartQuery,
  useClearCart,
  useRemoveCartItem,
  useSetCartItemQty,
} from '@/api/cart';

import { useCartStore } from './cart-store';

export type CartLine = CartLineInput & { qty: number };

export function useCartItems(): CartLine[] {
  const { cart } = useCartQuery();
  return (
    cart?.items.map((item) => ({
      productId: item.productId,
      slug: item.product.slug,
      title: item.product.name,
      priceMinor: item.product.priceMinor,
      currency: item.product.currency,
      imageUrl: item.product.images[0],
      qty: item.qty,
    })) ?? []
  );
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
  const { addCartItemsBatch, addCartItemsBatchAsync, addCartItemsBatchIsPending } = useAddCartItemsBatch();
  const { setCartItemQty, setCartItemQtyIsUpdatingProduct } = useSetCartItemQty();
  const { removeCartItem, removeCartItemIsRemovingProduct } = useRemoveCartItem();
  const { clearCart, clearCartIsPending } = useClearCart();
  const openPanel = useCartStore((state) => state.openPanel);
  const closePanel = useCartStore((state) => state.closePanel);
  const beginCheckout = useCartStore((state) => state.beginCheckout);

  return {
    addItem: (line: Omit<CartLine, 'qty'>, qty = 1) => {
      addCartItem({ ...line, qty });
    },
    addItemsBatch: (
      lines: Array<Omit<CartLine, 'qty'> & { qty?: number }>,
      options?: { suppressPanelOpen?: boolean },
    ) => {
      addCartItemsBatch({ lines, suppressPanelOpen: options?.suppressPanelOpen });
    },
    addItemsBatchAsync: (
      lines: Array<Omit<CartLine, 'qty'> & { qty?: number }>,
      options?: { suppressPanelOpen?: boolean },
    ) => addCartItemsBatchAsync({ lines, suppressPanelOpen: options?.suppressPanelOpen }),
    addItemsBatchIsPending: addCartItemsBatchIsPending,
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
    isAddingProduct: addCartItemIsAddingProduct,
    isUpdatingProduct: setCartItemQtyIsUpdatingProduct,
    isRemovingProduct: removeCartItemIsRemovingProduct,
    openPanel,
    closePanel,
    beginCheckout,
  };
}
