import { AppException, HttpStatus, NotFoundException } from '@my-noodles/api-lib/exceptions';

export class VisitorSessionNotResolvedException extends AppException {
  static readonly sample = new VisitorSessionNotResolvedException();

  constructor() {
    super({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'visitor_session_not_resolved',
      message: 'Visitor session was not resolved for this request',
    });
  }
}

export class VisitorSessionNotFoundException extends NotFoundException {
  static readonly sample = new VisitorSessionNotFoundException();

  constructor() {
    super({
      code: 'visitor_session_not_found',
      message: 'Visitor session was not found for this request',
    });
  }
}
