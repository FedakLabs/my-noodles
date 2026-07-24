import { NotFoundException, SAMPLE_UUID } from '@my-noodles/api-lib/exceptions';

export class CollectionNotFoundException extends NotFoundException {
  static readonly sample = new CollectionNotFoundException(SAMPLE_UUID);

  constructor(collectionId: string) {
    super({
      code: 'collection_not_found',
      message: 'Collection not found',
      payload: { collectionId },
    });
  }
}
