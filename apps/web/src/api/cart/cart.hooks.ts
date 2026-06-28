'use client';

import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCartStore } from '@/hooks/cart/cart-store';
import { useShowCartApiError } from '@/hooks/cart/use-show-cart-api-error';
import { trackAddToCart, trackRemoveFromCart } from '@/shared/analytics';
import { isApiConflict } from '@/shared/api-error';

import {
  addCartItem,
  cartMutationKeys,
  cartQueryKeys,
  clearCart,
  fetchCart,
  removeCartItem,
  setCartItemQty,
} from './cart';
import type { CartLineInput } from './types';

export function useCartQuery() {
  return formatUseQuery(
    useQuery({
      queryKey: cartQueryKeys.all(),
      queryFn: fetchCart,
    }),
    'cart',
  );
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  const openPanelIfFirstAdd = useCartStore((state) => state.openPanelIfFirstAdd);
  const showCartApiError = useShowCartApiError();

  const mutation = useMutation({
    mutationKey: cartMutationKeys.addItem(),
    mutationFn: ({ productId, qty = 1 }: CartLineInput) => addCartItem({ productId, qty }),
    onSuccess: async (cart, variables) => {
      await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
      if (!variables.suppressPanelOpen) {
        openPanelIfFirstAdd(cart.itemCount === variables.qty);
      }
      trackAddToCart(
        {
          productId: variables.productId,
          slug: variables.slug,
          title: variables.title,
          priceMinor: variables.priceMinor,
          currency: variables.currency,
          imageUrl: variables.imageUrl,
        },
        variables.qty ?? 1,
      );
    },
    onError: async (error) => {
      showCartApiError(error);
      if (isApiConflict(error)) {
        await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
      }
    },
  });

  const addCartItemPendingProductIds = useMutationState({
    filters: { mutationKey: cartMutationKeys.addItem(), status: 'pending' },
    select: (entry) => (entry.state.variables as CartLineInput | undefined)?.productId,
  }).filter((id): id is string => id != null);

  const addCartItemIsAddingProduct = useCallback(
    (productId: string) => addCartItemPendingProductIds.includes(productId),
    [addCartItemPendingProductIds],
  );

  return {
    ...formatUseMutation(mutation, 'addCartItem'),
    addCartItemPendingProductIds,
    addCartItemIsAddingProduct,
  };
}

export function useSetCartItemQty() {
  const queryClient = useQueryClient();
  const showCartApiError = useShowCartApiError();

  return formatUseMutation(
    useMutation({
      mutationFn: ({
        productId,
        qty,
        analyticsLine: _analyticsLine,
      }: {
        productId: string;
        qty: number;
        analyticsLine?: CartLineInput & { qty: number };
      }) => setCartItemQty(productId, qty),
      onSuccess: async (_cart, variables) => {
        await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
        const line = variables.analyticsLine;
        if (!line) {
          return;
        }
        if (variables.qty < line.qty) {
          trackRemoveFromCart({ ...line, qty: line.qty - variables.qty });
        } else if (variables.qty > line.qty) {
          trackAddToCart(
            {
              productId: line.productId,
              slug: line.slug,
              title: line.title,
              priceMinor: line.priceMinor,
              currency: line.currency,
              imageUrl: line.imageUrl,
            },
            variables.qty - line.qty,
          );
        }
      },
      onError: async (error) => {
        showCartApiError(error);
        if (isApiConflict(error)) {
          await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
        }
      },
    }),
    'setCartItemQty',
  );
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: ({ productId }: { productId: string; analyticsLine?: CartLineInput & { qty: number } }) =>
        removeCartItem(productId),
      onSuccess: async (_cart, variables) => {
        await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
        if (variables.analyticsLine) {
          trackRemoveFromCart(variables.analyticsLine);
        }
      },
    }),
    'removeCartItem',
  );
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationKey: cartMutationKeys.clearCart(),
      mutationFn: clearCart,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() });
      },
    }),
    'clearCart',
  );
}
