import { AppException, HttpStatus, type HttpStatusCode } from '../exceptions';

export class ApiClientException extends AppException {
  constructor(init: { message: string; status?: HttpStatusCode; internal?: unknown }) {
    super({
      status: init.status ?? HttpStatus.BAD_GATEWAY,
      code: 'api_client_error',
      message: init.message,
      internal: init.internal,
    });
  }
}
