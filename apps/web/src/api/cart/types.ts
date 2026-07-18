export type { AddCartItemDto, CartItem, CartResponseDto } from '@my-noodles/api-clients/storefront';

export type CartLineInput = {
  productId: string;
  slug: string;
  title: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string;
  qty?: number;
  /** Skip auto-opening the cart panel (e.g. add from Saved while a drawer is already open). */
  suppressPanelOpen?: boolean;
};
