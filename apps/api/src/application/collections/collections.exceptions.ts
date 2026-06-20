import { NotFoundException } from '@nestjs/common';

export class CollectionNotFoundException extends NotFoundException {
  constructor(slug: string) {
    super({ message: 'Collection not found', slug });
  }
}
