import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class FeedProductNotFoundException extends AppException {
  constructor(productId: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      code: 'feed_product_not_found',
      message: 'Product not found',
      payload: { productId },
    });
  }
}
