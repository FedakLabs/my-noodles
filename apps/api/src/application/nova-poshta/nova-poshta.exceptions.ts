import { AppException, HttpStatus } from '@my-noodles/api-lib/exceptions';

export class NovaPoshtaException extends AppException<{ reason: string }> {
  constructor(reason: string) {
    super(HttpStatus.BAD_GATEWAY, 'nova_poshta_error', 'Nova Poshta request failed', { reason });
  }

  static from(error: unknown): NovaPoshtaException {
    if (error instanceof NovaPoshtaException) {
      return error;
    }

    return new NovaPoshtaException(error instanceof Error ? error.message : String(error));
  }
}
