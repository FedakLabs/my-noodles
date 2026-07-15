import { AppException, HttpStatus, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class CartProductNotFoundException extends AppException<{ productId: string }> {
  static readonly sample = new CartProductNotFoundException(SAMPLE_UUID);

  constructor(productId: string) {
    super(HttpStatus.NOT_FOUND, 'cart_product_not_found', 'Product not found for cart', { productId });
  }
}

export class CartItemNotFoundException extends AppException<{ productId: string }> {
  static readonly sample = new CartItemNotFoundException(SAMPLE_UUID);

  constructor(productId: string) {
    super(HttpStatus.NOT_FOUND, 'cart_item_not_found', 'Cart item not found', { productId });
  }
}

export class CartEmptyException extends AppException {
  static readonly sample = new CartEmptyException();

  constructor() {
    super(HttpStatus.BAD_REQUEST, 'cart_empty', 'Cart is empty');
  }
}

export class CartProductOutOfStockException extends AppException<{ productId: string }> {
  static readonly sample = new CartProductOutOfStockException(SAMPLE_UUID);

  constructor(productId: string) {
    super(HttpStatus.CONFLICT, 'cart_product_out_of_stock', 'Product out of stock', { productId });
  }
}

export class CartMaxQuantityReachedException extends AppException<{ productId: string; maxQty: number }> {
  static readonly sample = new CartMaxQuantityReachedException(SAMPLE_UUID, 10);

  constructor(productId: string, maxQty: number) {
    super(HttpStatus.CONFLICT, 'cart_max_quantity_reached', 'Max quantity reached', { productId, maxQty });
  }
}

export class CartInventoryChangedException extends AppException {
  static readonly sample = new CartInventoryChangedException();

  constructor() {
    super(HttpStatus.CONFLICT, 'cart_inventory_changed', 'Cart inventory changed since last update');
  }
}
