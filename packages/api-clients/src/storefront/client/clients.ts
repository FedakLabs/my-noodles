import { ApiError } from '../../common';
import type { Client } from '../generated/client';
import { client } from '../generated/client.gen';

export const APP_LOCALE_HEADER = 'x-app-locale';

export type StorefrontApiOptions = {
  baseUrl: string;
};

type AppErrorBody = {
  status: number;
  identifier: string;
  message: string;
  payload?: unknown;
};

function isAppErrorBody(value: unknown): value is AppErrorBody {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const body = value as Partial<AppErrorBody>;
  return (
    typeof body.status === 'number' && typeof body.identifier === 'string' && typeof body.message === 'string'
  );
}

function toApiError(error: unknown, response?: Response): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const status = response?.status ?? 0;

  if (typeof error === 'object' && error !== null) {
    const body = error as {
      message?: string | string[] | { message?: string; code?: string; identifier?: string };
      code?: string;
      identifier?: string;
      payload?: unknown;
      status?: number;
    };

    if (isAppErrorBody(body)) {
      return new ApiError(body.message, body.status, body.identifier, body.payload ?? null);
    }

    if (typeof body.message === 'object' && body.message !== null && !Array.isArray(body.message)) {
      const nested = body.message;
      return new ApiError(nested.message ?? 'Request failed', status, nested.identifier ?? nested.code);
    }

    const payload = body.message;
    const message = Array.isArray(payload) ? payload.join(', ') : (payload ?? 'Request failed');
    const code =
      typeof body.identifier === 'string'
        ? body.identifier
        : typeof body.code === 'string'
          ? body.code
          : undefined;

    return new ApiError(message, status, code, body.payload);
  }

  if (typeof error === 'string' && error.length > 0) {
    return new ApiError(error, status);
  }

  return new ApiError('Request failed', status);
}

/**
 * Configures the shared hey-api storefront client (base URL, locale header, error mapping).
 * Construct once at app bootstrap; use `.client` with generated SDK helpers when not relying on the package default.
 */
export class StorefrontApi {
  readonly client: Client;

  private resolveAppLocale: (() => string | undefined) | undefined;

  private static interceptorsAttached = false;
  private static active: StorefrontApi | undefined;

  constructor(options: StorefrontApiOptions) {
    this.client = client;
    StorefrontApi.active = this;
    StorefrontApi.attachInterceptors();
    this.client.setConfig({ baseUrl: options.baseUrl });
  }

  /** Register a locale resolver for the `x-app-locale` request header. */
  registerAppLocaleProvider(fn: () => string | undefined): void {
    this.resolveAppLocale = fn;
  }

  private static attachInterceptors(): void {
    if (StorefrontApi.interceptorsAttached) {
      return;
    }

    client.interceptors.request.use((request) => {
      request.headers.set('Accept', 'application/json');

      if (!request.headers.has(APP_LOCALE_HEADER)) {
        const locale = StorefrontApi.active?.resolveAppLocale?.();
        if (locale) {
          request.headers.set(APP_LOCALE_HEADER, locale);
        }
      }

      return request;
    });

    client.interceptors.error.use((error, response) => {
      throw toApiError(error, response);
    });

    StorefrontApi.interceptorsAttached = true;
  }
}

export { client };
