import { NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class SellerNotFoundException extends NotFoundException {
  static readonly sample = new SellerNotFoundException(SAMPLE_UUID);

  constructor(sellerId: string) {
    super({
      code: 'seller_not_found',
      message: 'Seller not found',
      payload: { sellerId },
    });
  }
}
