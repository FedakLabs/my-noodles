import { ApiError } from '@my-noodles/api-clients';
import { setupApiClients, type StorefrontApiClients } from '@my-noodles/api-clients/storefront';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_URL } from '@/shared/env';

let clients: StorefrontApiClients | undefined;

export function getApiClients(): StorefrontApiClients {
  clients ??= createApiClients();
  return clients;
}

function createApiClients(): StorefrontApiClients {
  const apiClients = setupApiClients(API_URL);

  apiClients.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers.set('Accept', 'application/json');
    return config;
  });

  apiClients.instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string | string[] }>) => {
      const status = error.response?.status ?? 0;
      const payload = error.response?.data?.message;
      const message = Array.isArray(payload)
        ? payload.join(', ')
        : (payload ?? error.message ?? 'Request failed');

      throw new ApiError(message, status);
    },
  );

  return apiClients;
}
