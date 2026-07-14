import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class CollectionNotFoundException extends AppException<{ slug: string }> {
  constructor(slug: string) {
    super(HttpStatus.NOT_FOUND, 'collection_not_found', 'Collection not found', { slug });
  }
}
