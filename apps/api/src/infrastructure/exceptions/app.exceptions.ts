import { AppException as LibAppException, type HttpStatusCode } from '@my-noodles/api-lib/exceptions';

import { NestAppException } from './nest-exception';

export class AppException<T = null> extends NestAppException {
  constructor(status: HttpStatusCode, identifier: string, message: string, payload?: T) {
    super(new LibAppException(status, identifier, message, payload ?? null));
  }
}
