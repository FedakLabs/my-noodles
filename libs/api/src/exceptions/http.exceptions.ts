import { AppException } from './app.exception';
import { HttpStatus } from './http-status';
import type { FieldValidationError } from './validation-error';

export const SERVICE_UNAVAILABLE_FALLBACK_MESSAGE = 'Internal server error';
export const SERVER_SIDE_FALLBACK_MESSAGE = 'Internal server error';

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

export class TooManyRequestsException extends AppException {
  constructor(message: string = 'Too many requests') {
    super(HttpStatus.TOO_MANY_REQUESTS, 'too_many_requests', message);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(message: string = SERVICE_UNAVAILABLE_FALLBACK_MESSAGE) {
    super(HttpStatus.SERVICE_UNAVAILABLE, 'service_unavailable', message);
  }
}

export class ServerSideException extends AppException {
  constructor(message: string = SERVER_SIDE_FALLBACK_MESSAGE) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, 'internal_server_error', message);
  }
}

export class ValidationException extends AppException<{ fields: FieldValidationError[] }> {
  constructor(fields: FieldValidationError[]) {
    super(HttpStatus.BAD_REQUEST, 'validation_failed', 'Validation failed', { fields });
  }
}
