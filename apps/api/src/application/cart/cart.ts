import { DEFAULT_CURRENCY, type CurrencyCode } from '@my-noodles/utils';

import { CartItem } from './cart-item.entity';

/** Code-only cart aggregate — identity is the visitor session id. */
export class Cart {
  /** Same as visitor session id. */
  id!: string;

  items!: CartItem[];

  totalMinor!: number;

  itemCount!: number;

  currency!: CurrencyCode;

  static fromItems(visitorSessionId: string, items: CartItem[]): Cart {
    const cart = new Cart();
    cart.id = visitorSessionId;
    cart.items = items;
    cart.totalMinor = items.reduce((sum, item) => sum + item.product.priceMinor * item.qty, 0);
    cart.itemCount = items.reduce((sum, item) => sum + item.qty, 0);
    cart.currency = items[0]?.product.currency ?? DEFAULT_CURRENCY;
    return cart;
  }
}
