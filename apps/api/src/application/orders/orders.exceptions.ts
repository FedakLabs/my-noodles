import { BadRequestException, NotFoundException } from '@nestjs/common';

export class OrderProductNotFoundException extends NotFoundException {
  constructor(productId: string) {
    super({ message: 'Product not found for order', productId });
  }
}

export class HoneypotTriggeredException extends BadRequestException {
  constructor() {
    super({ message: 'Invalid submission' });
  }
}
