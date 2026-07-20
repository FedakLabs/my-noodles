import { AppException } from './app.exception';
import { HttpStatus } from './http-status';
import type { FieldValidationError } from './validation-error';

export const SERVICE_UNAVAILABLE_FALLBACK_MESSAGE = 'Internal server error';
export const SERVER_SIDE_FALLBACK_MESSAGE = 'Internal server error';

type PresetExceptionInit = Readonly<{
  code: string;
  message: string;
  payload?: unknown;
  internal?: unknown;
}>;

export class BadRequestException extends AppException {
  constructor(init: PresetExceptionInit) {
    super({ status: HttpStatus.BAD_REQUEST, ...init });
  }
}

export class NotFoundException extends AppException {
  constructor(init: PresetExceptionInit) {
    super({ status: HttpStatus.NOT_FOUND, ...init });
  }
}

export class ConflictException extends AppException {
  constructor(init: PresetExceptionInit) {
    super({ status: HttpStatus.CONFLICT, ...init });
  }
}

export class TooManyRequestsException extends AppException {
  constructor(init: { message?: string; internal?: unknown } = {}) {
    super({
      status: HttpStatus.TOO_MANY_REQUESTS,
      code: 'too_many_requests',
      message: init.message ?? 'Too many requests',
      internal: init.internal,
    });
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(init: { message?: string; internal?: unknown } = {}) {
    super({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      code: 'service_unavailable',
      message: init.message ?? SERVICE_UNAVAILABLE_FALLBACK_MESSAGE,
      internal: init.internal,
    });
  }
}

export class ServerSideException extends AppException {
  constructor(init: { message?: string; internal?: unknown } = {}) {
    super({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'internal_server_error',
      message: init.message ?? SERVER_SIDE_FALLBACK_MESSAGE,
      internal: init.internal,
    });
  }
}

export class ValidationException extends AppException {
  constructor(init: { fields: FieldValidationError[]; internal?: unknown }) {
    super({
      status: HttpStatus.BAD_REQUEST,
      code: 'validation_failed',
      message: 'Validation failed',
      payload: { fields: init.fields },
      internal: init.internal,
    });
  }
}
