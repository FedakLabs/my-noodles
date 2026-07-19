import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class VisitorSessionNotResolvedException extends AppException {
  static readonly sample = new VisitorSessionNotResolvedException();

  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'visitor_session_not_resolved',
      'Visitor session was not resolved for this request',
    );
  }
}
