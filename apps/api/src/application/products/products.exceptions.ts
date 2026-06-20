import { NotFoundException } from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
  constructor(slug: string) {
    super({ message: 'Product not found', slug });
  }
}
