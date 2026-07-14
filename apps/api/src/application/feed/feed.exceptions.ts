import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class FeedProductNotFoundException extends AppException<{ productId: string }> {
  constructor(productId: string) {
    super(HttpStatus.NOT_FOUND, 'feed_product_not_found', 'Product not found', { productId });
  }
}
