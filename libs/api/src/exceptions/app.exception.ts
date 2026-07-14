import type { HttpStatusCode } from './http-status';

export type AppErrorBody<T = null> = Readonly<{
  status: HttpStatusCode;
  identifier: string;
  message: string;
  payload: T;
}>;

/** Framework-agnostic API error — Nest maps and serializes via ExceptionsFilter. */
export class AppException<T = null> extends Error {
  readonly status: HttpStatusCode;
  readonly identifier: string;
  readonly payload: T;

  constructor(status: HttpStatusCode, identifier: string, message: string, payload?: T) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.identifier = identifier;
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
