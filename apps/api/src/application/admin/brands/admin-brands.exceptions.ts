import { NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class BrandNotFoundException extends NotFoundException {
  static readonly sample = new BrandNotFoundException(SAMPLE_UUID);

  constructor(brandId: string) {
    super({
      code: 'brand_not_found',
      message: 'Brand not found',
      payload: { brandId },
    });
  }
}
