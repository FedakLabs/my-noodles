import {
  type AddCartItemDto,
  type AddCartItemsBatchDto,
  cartControllerAddItem,
  cartControllerAddItemsBatch,
  cartControllerClearCart,
  cartControllerGetCart,
  cartControllerRemoveItem,
  cartControllerSetItemQty,
} from '@my-noodles/api-clients/storefront';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export const cartQueries = {
  rootKey: ['cart'] as const,
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => cartQueries.rootKey)(),
      queryFn: () => cartControllerGetCart(),
    }),
};

export const cartMutations = {
  rootKey: cartQueries.rootKey,
  addItem: () =>
    mutationOptions({
      mutationKey: [...cartMutations.rootKey, 'addItem'] as const,
      mutationFn: (body: AddCartItemDto) => cartControllerAddItem({ body }),
    }),
  addItemsBatch: () =>
    mutationOptions({
      mutationKey: [...cartMutations.rootKey, 'addItemsBatch'] as const,
      mutationFn: (body: AddCartItemsBatchDto) => cartControllerAddItemsBatch({ body }),
    }),
  setItemQty: () =>
    mutationOptions({
      mutationKey: [...cartMutations.rootKey, 'setItemQty'] as const,
      mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
        cartControllerSetItemQty({ path: { productId }, body: { qty } }),
    }),
  removeItem: () =>
    mutationOptions({
      mutationKey: [...cartMutations.rootKey, 'removeItem'] as const,
      mutationFn: ({ productId }: { productId: string }) => cartControllerRemoveItem({ path: { productId } }),
    }),
  clearCart: () =>
    mutationOptions({
      mutationKey: [...cartMutations.rootKey, 'clearCart'] as const,
      mutationFn: () => cartControllerClearCart(),
    }),
};
