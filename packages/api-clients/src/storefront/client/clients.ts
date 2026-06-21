import { ApiError } from '../../common';
import { client } from '../generated/client.gen';

let interceptorsAttached = false;

function toApiError(error: unknown, response?: Response): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const status = response?.status ?? 0;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const payload = (error as { message?: string | string[] }).message;
    const message = Array.isArray(payload) ? payload.join(', ') : (payload ?? 'Request failed');

    return new ApiError(message, status);
  }

  if (typeof error === 'string' && error.length > 0) {
    return new ApiError(error, status);
  }

  return new ApiError('Request failed', status);
}

function attachInterceptors(): void {
  if (interceptorsAttached) {
    return;
  }

  client.interceptors.request.use((request) => {
    request.headers.set('Accept', 'application/json');
    return request;
  });

  client.interceptors.error.use((error, response) => {
    throw toApiError(error, response);
  });

  interceptorsAttached = true;
}

export type StorefrontApiClient = typeof client;

/** Configure the shared fetch client — idempotent; safe to call from SSR and browser. */
export function setupApiClients(baseUrl: string): StorefrontApiClient {
  attachInterceptors();
  client.setConfig({ baseUrl });
  return client;
}

export { client };
