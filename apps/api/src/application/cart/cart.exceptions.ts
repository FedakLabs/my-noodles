import { HttpStatus } from '@my-noodles/api-lib/exceptions';

import { AppException } from '@/infrastructure/exceptions';

export class CartProductNotFoundException extends AppException<{ productId: string }> {
  constructor(productId: string) {
    super(HttpStatus.NOT_FOUND, 'cart_product_not_found', 'Product not found for cart', { productId });
  }
}

export class CartItemNotFoundException extends AppException<{ productId: string }> {
  constructor(productId: string) {
    super(HttpStatus.NOT_FOUND, 'cart_item_not_found', 'Cart item not found', { productId });
  }
}

export class CartEmptyException extends AppException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, 'cart_empty', 'Cart is empty');
  }
}

export class CartProductOutOfStockException extends AppException<{ productId: string }> {
  constructor(productId: string) {
    super(HttpStatus.CONFLICT, 'cart_product_out_of_stock', 'Product out of stock', { productId });
  }
}

export class CartMaxQuantityReachedException extends AppException<{ productId: string; maxQty: number }> {
  constructor(productId: string, maxQty: number) {
    super(HttpStatus.CONFLICT, 'cart_max_quantity_reached', 'Max quantity reached', { productId, maxQty });
  }
}

export class CartInventoryChangedException extends AppException {
  constructor() {
    super(HttpStatus.CONFLICT, 'cart_inventory_changed', 'Cart inventory changed since last update');
  }
}
