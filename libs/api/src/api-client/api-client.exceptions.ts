import { AppException, HttpStatus, type HttpStatusCode } from '../exceptions';

export class ApiClientException extends AppException<unknown> {
  constructor(message: string, response: unknown = null, status: HttpStatusCode = HttpStatus.BAD_GATEWAY) {
    super(status, 'api_client_error', message, response);
  }
}
