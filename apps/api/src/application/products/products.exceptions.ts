import { HttpStatus } from '@my-noodles/api-lib/exceptions';

import { AppException } from '@/infrastructure/exceptions';

export class ProductNotFoundException extends AppException<{ slug: string }> {
  constructor(slug: string) {
    super(HttpStatus.NOT_FOUND, 'product_not_found', 'Product not found', { slug });
  }
}
