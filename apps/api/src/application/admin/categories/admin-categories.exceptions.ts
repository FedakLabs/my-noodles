import { NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class CategoryNotFoundException extends NotFoundException {
  static readonly sample = new CategoryNotFoundException(SAMPLE_UUID);

  constructor(categoryId: string) {
    super({
      code: 'category_not_found',
      message: 'Category not found',
      payload: { categoryId },
    });
  }
}
