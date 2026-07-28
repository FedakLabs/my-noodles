'use client';

import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCartStore } from '@/hooks/cart/cart-store';
import { useShowCartApiError } from '@/hooks/cart/use-show-cart-api-error';
import { trackAddToCart, trackRemoveFromCart } from '@/shared/analytics';
import { isApiConflict } from '@/shared/api-error';

import { cartMutations, cartQueries } from './cart';
import type { AddCartItemsBatchVariables, CartLineInput } from './types';

export function useCartQuery() {
  return formatUseQuery(useQuery(cartQueries.all()), 'cart');
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  const openPanelIfFirstAdd = useCartStore((state) => state.openPanelIfFirstAdd);
  const showCartApiError = useShowCartApiError();
  const addItem = cartMutations.addItem();

  const mutation = useMutation({
    ...addItem,
    mutationFn: ({ productId, qty = 1 }: CartLineInput, context) =>
      addItem.mutationFn!({ productId, qty }, context),
    onSuccess: async (cart, variables) => {
      await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
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
        await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
      }
    },
  });

  const addCartItemPendingProductIds = useMutationState({
    filters: { mutationKey: addItem.mutationKey, status: 'pending' },
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

export function useAddCartItemsBatch() {
  const queryClient = useQueryClient();
  const openPanelIfFirstAdd = useCartStore((state) => state.openPanelIfFirstAdd);
  const showCartApiError = useShowCartApiError();
  const addItemsBatch = cartMutations.addItemsBatch();

  const mutation = useMutation({
    mutationKey: addItemsBatch.mutationKey,
    mutationFn: ({ lines }: AddCartItemsBatchVariables, context) =>
      addItemsBatch.mutationFn!(
        {
          items: lines.map((line) => ({ productId: line.productId, qty: line.qty ?? 1 })),
        },
        context,
      ),
    onSuccess: async (cart, variables) => {
      await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
      const addedQty = variables.lines.reduce((sum, line) => sum + (line.qty ?? 1), 0);
      if (!variables.suppressPanelOpen) {
        openPanelIfFirstAdd(cart.itemCount === addedQty);
      }
      for (const line of variables.lines) {
        trackAddToCart(
          {
            productId: line.productId,
            slug: line.slug,
            title: line.title,
            priceMinor: line.priceMinor,
            currency: line.currency,
            imageUrl: line.imageUrl,
          },
          line.qty ?? 1,
        );
      }
    },
    onError: async (error, variables) => {
      const productTitles = Object.fromEntries(variables.lines.map((line) => [line.productId, line.title]));
      showCartApiError(error, 'mutationError', productTitles);
      if (isApiConflict(error)) {
        await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
      }
    },
  });

  return formatUseMutation(mutation, 'addCartItemsBatch');
}

type SetCartItemQtyVariables = {
  productId: string;
  qty: number;
  analyticsLine?: CartLineInput & { qty: number };
};

type RemoveCartItemVariables = {
  productId: string;
  analyticsLine?: CartLineInput & { qty: number };
};

export function useSetCartItemQty() {
  const queryClient = useQueryClient();
  const showCartApiError = useShowCartApiError();
  const setItemQty = cartMutations.setItemQty();

  const mutation = useMutation({
    ...setItemQty,
    mutationFn: ({ productId, qty }: SetCartItemQtyVariables, context) =>
      setItemQty.mutationFn!({ productId, qty }, context),
    onSuccess: async (_cart, variables) => {
      await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
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
        await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
      }
    },
  });

  const setCartItemQtyPendingProductIds = useMutationState({
    filters: { mutationKey: setItemQty.mutationKey, status: 'pending' },
    select: (entry) => (entry.state.variables as SetCartItemQtyVariables | undefined)?.productId,
  }).filter((id): id is string => id != null);

  const setCartItemQtyIsUpdatingProduct = useCallback(
    (productId: string) => setCartItemQtyPendingProductIds.includes(productId),
    [setCartItemQtyPendingProductIds],
  );

  return {
    ...formatUseMutation(mutation, 'setCartItemQty'),
    setCartItemQtyPendingProductIds,
    setCartItemQtyIsUpdatingProduct,
  };
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const removeItem = cartMutations.removeItem();

  const mutation = useMutation({
    ...removeItem,
    mutationFn: ({ productId }: RemoveCartItemVariables, context) =>
      removeItem.mutationFn!({ productId }, context),
    onSuccess: async (_cart, variables) => {
      await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
      if (variables.analyticsLine) {
        trackRemoveFromCart(variables.analyticsLine);
      }
    },
  });

  const removeCartItemPendingProductIds = useMutationState({
    filters: { mutationKey: removeItem.mutationKey, status: 'pending' },
    select: (entry) => (entry.state.variables as RemoveCartItemVariables | undefined)?.productId,
  }).filter((id): id is string => id != null);

  const removeCartItemIsRemovingProduct = useCallback(
    (productId: string) => removeCartItemPendingProductIds.includes(productId),
    [removeCartItemPendingProductIds],
  );

  return {
    ...formatUseMutation(mutation, 'removeCartItem'),
    removeCartItemPendingProductIds,
    removeCartItemIsRemovingProduct,
  };
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...cartMutations.clearCart(),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey });
      },
    }),
    'clearCart',
  );
}
