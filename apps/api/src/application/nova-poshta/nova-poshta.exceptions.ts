import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class NovaPoshtaException extends AppException {
  constructor(reason: string, internal?: unknown) {
    super({
      status: HttpStatus.BAD_GATEWAY,
      code: 'nova_poshta_error',
      message: 'Nova Poshta request failed',
      payload: { reason },
      internal,
    });
  }

  static from(error: unknown): NovaPoshtaException {
    if (error instanceof NovaPoshtaException) {
      return error;
    }

    const reason = error instanceof Error ? error.message : String(error);
    const internal = error instanceof AppException ? (error.internal ?? error.toBody()) : error;

    return new NovaPoshtaException(reason, internal);
  }
}
