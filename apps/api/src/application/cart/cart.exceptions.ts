import { AppException, HttpStatus, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class CartProductNotFoundException extends AppException {
  static readonly sample = new CartProductNotFoundException(SAMPLE_UUID);

  constructor(productId: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      code: 'cart_product_not_found',
      message: 'Product not found for cart',
      payload: { productId },
    });
  }
}

export class CartItemNotFoundException extends AppException {
  static readonly sample = new CartItemNotFoundException(SAMPLE_UUID);

  constructor(productId: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      code: 'cart_item_not_found',
      message: 'Cart item not found',
      payload: { productId },
    });
  }
}

export class CartEmptyException extends AppException {
  static readonly sample = new CartEmptyException();

  constructor() {
    super({
      status: HttpStatus.BAD_REQUEST,
      code: 'cart_empty',
      message: 'Cart is empty',
    });
  }
}

export class CartProductOutOfStockException extends AppException {
  static readonly sample = new CartProductOutOfStockException(SAMPLE_UUID);

  constructor(productId: string) {
    super({
      status: HttpStatus.CONFLICT,
      code: 'cart_product_out_of_stock',
      message: 'Product out of stock',
      payload: { productId },
    });
  }
}

export class CartMaxQuantityReachedException extends AppException {
  static readonly sample = new CartMaxQuantityReachedException(SAMPLE_UUID, 10);

  constructor(productId: string, maxQty: number) {
    super({
      status: HttpStatus.CONFLICT,
      code: 'cart_max_quantity_reached',
      message: 'Max quantity reached',
      payload: { productId, maxQty },
    });
  }
}

export class CartInventoryChangedException extends AppException {
  static readonly sample = new CartInventoryChangedException();

  constructor() {
    super({
      status: HttpStatus.CONFLICT,
      code: 'cart_inventory_changed',
      message: 'Cart inventory changed since last update',
    });
  }
}
