import type { HttpStatusCode } from './http-status';

export type AppErrorBody<T = null> = Readonly<{
  status: HttpStatusCode;
  identifier: string;
  message: string;
  payload: T;
}>;

/** Framework-agnostic API error — map to HTTP in the Nest adapter layer. */
export class AppException<T = null> {
  readonly status: HttpStatusCode;
  readonly identifier: string;
  readonly message: string;
  readonly payload: T;

  constructor(status: HttpStatusCode, identifier: string, message: string, payload?: T) {
    this.status = status;
    this.identifier = identifier;
    this.message = message;
    this.payload = (payload ?? null) as T;
  }

  toBody(): AppErrorBody<T> {
    return {
      status: this.status,
      identifier: this.identifier,
      message: this.message,
      payload: this.payload,
    };
  }
}
