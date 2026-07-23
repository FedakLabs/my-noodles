import { ApiError } from '../common';
import type { Client } from './generated/client';
import { client as apiClient } from './generated/client.gen';

export type AuthApiOptions = {
  baseUrl: string;
};

type AppErrorBody = {
  status: number;
  code: string;
  message: string;
  payload?: unknown;
};

function isAppErrorBody(value: unknown): value is AppErrorBody {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const body = value as Partial<AppErrorBody>;
  return typeof body.status === 'number' && typeof body.code === 'string' && typeof body.message === 'string';
}

function toApiError(error: unknown, response?: Response): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const status = response?.status ?? 0;

  if (typeof error === 'object' && error !== null) {
    const body = error as {
      message?: string | string[] | { message?: string; code?: string };
      code?: string;
      payload?: unknown;
      status?: number;
    };

    if (isAppErrorBody(body)) {
      return new ApiError(body.message, body.status, body.code, body.payload ?? null);
    }

    if (typeof body.message === 'object' && body.message !== null && !Array.isArray(body.message)) {
      const nested = body.message;
      return new ApiError(nested.message ?? 'Request failed', status, nested.code);
    }

    const payload = body.message;
    const message = Array.isArray(payload) ? payload.join(', ') : (payload ?? 'Request failed');
    const code = typeof body.code === 'string' ? body.code : undefined;

    return new ApiError(message, status, code, body.payload);
  }

  if (typeof error === 'string' && error.length > 0) {
    return new ApiError(error, status);
  }

  return new ApiError('Request failed', status);
}

/**
 * Configures the shared hey-api auth client (base URL, error mapping).
 * Construct once at app bootstrap; use `.apiClient` with generated SDK helpers.
 * No bearer / 401 refresh — login and refresh are unauthenticated.
 */
export class AuthApi {
  readonly apiClient: Client;

  private static interceptorsAttached = false;

  constructor(options: AuthApiOptions) {
    this.apiClient = apiClient;
    AuthApi.attachInterceptors();
    this.apiClient.setConfig({
      baseUrl: options.baseUrl,
      throwOnError: true,
      responseStyle: 'data',
    });
  }

  private static attachInterceptors(): void {
    if (AuthApi.interceptorsAttached) {
      return;
    }

    apiClient.interceptors.request.use((request) => {
      request.headers.set('Accept', 'application/json');
      return request;
    });

    apiClient.interceptors.error.use((error, response) => {
      throw toApiError(error, response);
    });

    AuthApi.interceptorsAttached = true;
  }
}

export { apiClient };
