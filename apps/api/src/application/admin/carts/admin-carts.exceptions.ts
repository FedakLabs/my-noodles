import { NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class AdminCartNotFoundException extends NotFoundException {
  static readonly sample = new AdminCartNotFoundException(SAMPLE_UUID);

  constructor(visitorSessionId: string) {
    super({
      code: 'cart_not_found',
      message: 'Cart not found',
      payload: { visitorSessionId },
    });
  }
}
