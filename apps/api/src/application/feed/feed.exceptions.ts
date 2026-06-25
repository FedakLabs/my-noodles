import { NotFoundException } from '@nestjs/common';

export class FeedProductNotFoundException extends NotFoundException {
  constructor(productId: string) {
    super({ message: 'Product not found', productId });
  }
}
