import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class CollectionNotFoundException extends AppException {
  constructor(slug: string) {
    super({
      status: HttpStatus.NOT_FOUND,
      code: 'collection_not_found',
      message: 'Collection not found',
      payload: { slug },
    });
  }
}
