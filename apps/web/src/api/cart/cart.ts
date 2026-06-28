import {
  type AddCartItemDto,
  cartControllerAddItem,
  cartControllerClearCart,
  cartControllerGetCart,
  cartControllerRemoveItem,
  cartControllerSetItemQty,
  type CartResponseDto,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export const cartQueryKeys = {
  all: withAppLocaleKey(() => ['cart'] as const),
};

/** Stable keys for `useMutation({ mutationKey })` and `useMutationState` filters — add only when needed. */
export const cartMutationKeys = {
  all: ['cart'] as const,
  addItem: () => ['cart', 'addItem'] as const,
  clearCart: () => ['cart', 'clearCart'] as const,
};

export async function fetchCart(): Promise<CartResponseDto> {
  return requestData(cartControllerGetCart());
}

export async function addCartItem(body: AddCartItemDto): Promise<CartResponseDto> {
  return requestData(cartControllerAddItem({ body }));
}

export async function setCartItemQty(productId: string, qty: number): Promise<CartResponseDto> {
  return requestData(cartControllerSetItemQty({ path: { productId }, body: { qty } }));
}

export async function removeCartItem(productId: string): Promise<CartResponseDto> {
  return requestData(cartControllerRemoveItem({ path: { productId } }));
}

export async function clearCart(): Promise<CartResponseDto> {
  return requestData(cartControllerClearCart());
}
