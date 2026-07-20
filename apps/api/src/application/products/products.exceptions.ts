import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class ProductNotFoundException extends AppException {
  constructor(slug: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      code: 'product_not_found',
      message: 'Product not found',
      payload: { slug },
    });
  }
}
