import { AppException } from './app.exception';
import { HttpStatus } from './http-status';

export const SERVICE_UNAVAILABLE_FALLBACK_MESSAGE = 'Internal server error';

export class BadRequestException extends AppException<Record<string, unknown> | null> {
  constructor(identifier: string, message: string, payload?: Record<string, unknown>) {
    super(HttpStatus.BAD_REQUEST, identifier, message, payload ?? null);
  }
}

export class NotFoundException extends AppException<Record<string, unknown> | null> {
  constructor(identifier: string, message: string, payload?: Record<string, unknown>) {
    super(HttpStatus.NOT_FOUND, identifier, message, payload ?? null);
  }
}

export class ConflictException extends AppException<Record<string, unknown> | null> {
  constructor(identifier: string, message: string, payload?: Record<string, unknown>) {
    super(HttpStatus.CONFLICT, identifier, message, payload ?? null);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(message: string = SERVICE_UNAVAILABLE_FALLBACK_MESSAGE) {
    super(HttpStatus.SERVICE_UNAVAILABLE, 'service_unavailable', message);
  }
}
