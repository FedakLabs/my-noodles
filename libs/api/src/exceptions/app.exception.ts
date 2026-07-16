import type { HttpStatusCode } from './http-status';

export const SAMPLE_UUID = '00000000-0000-4000-8000-000000000001';

export type AppErrorBody<T = null> = Readonly<{
  status: HttpStatusCode;
  code: string;
  message: string;
  payload: T;
}>;

/** Framework-agnostic API error — Nest maps and serializes via ExceptionsFilter. */
export class AppException<T = null> extends Error {
  readonly status: HttpStatusCode;
  readonly code: string;
  readonly payload: T;

  constructor(status: HttpStatusCode, code: string, message: string, payload?: T) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.payload = (payload ?? null) as T;
  }

  toBody(): AppErrorBody<T> {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      payload: this.payload,
    };
  }

  /** OpenAPI-compatible schema for this error body — inferred from the instance payload. */
  toErrorSchema(): Record<string, unknown> {
    return {
      type: 'object',
      required: ['status', 'code', 'message', 'payload'],
      properties: {
        status: { type: 'integer', enum: [this.status], example: this.status },
        code: { type: 'string', enum: [this.code], example: this.code },
        message: { type: 'string', example: this.message },
        payload: inferSchema(this.payload),
      },
    };
  }
}

function inferSchema(value: unknown): Record<string, unknown> {
  if (value === null) {
    return { type: 'object', nullable: true, example: null };
  }

  if (typeof value === 'string') {
    return { type: 'string', example: value };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean', example: value };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { type: 'integer', example: value } : { type: 'number', example: value };
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: value.length > 0 ? inferSchema(value[0]) : {},
      example: value,
    };
  }

  if (typeof value === 'object') {
    const properties = Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, inferSchema(entryValue)]),
    );

    return { type: 'object', properties, example: value };
  }

  return { example: value };
}
