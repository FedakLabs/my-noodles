import { authControllerRefresh, type AuthApi } from '../auth';
import { ApiError } from '../common';
import type { Client } from './generated/client';
import { client as apiClient } from './generated/client.gen';

export type AdminApiOptions = {
  baseUrl: string;
  /** Auth client used for token refresh — can point at a separate auth service later. */
  authApi: AuthApi;
};

type AppErrorBody = {
  status: number;
  code: string;
  message: string;
  payload?: unknown;
};

export type AdminApiTokenProvider = {
  getAccessToken: () => string | null | undefined;
  getRefreshToken: () => string | null | undefined;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void;
};

export type AdminApiAuthHandlers = {
  /** Called after tokens are cleared because refresh/retry failed. */
  onUnauthorized?: () => void;
  /** Override refresh call — defaults to generated `authControllerRefresh`. */
  refresh?: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string }>;
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

function isAuthPath(url: string | undefined): boolean {
  if (!url) {
    return false;
  }
  return url.includes('/api/auth/login') || url.includes('/api/auth/refresh');
}

/**
 * Configures the shared hey-api admin client (base URL, bearer token, 401 refresh, error mapping).
 * Construct once at app bootstrap.
 *
 * Note: hey-api `get`/`post` close over the internal `request` fn, so wrapping `client.request`
 * does not run for SDK calls. 401 refresh must live in a response interceptor instead.
 */
export class AdminApi {
  readonly apiClient: Client;

  private readonly authApi: AuthApi;
  private tokenProvider: AdminApiTokenProvider | undefined;
  private authHandlers: AdminApiAuthHandlers | undefined;
  private refreshPromise: Promise<boolean> | null = null;

  private static interceptorsAttached = false;
  private static active: AdminApi | undefined;

  constructor(options: AdminApiOptions) {
    this.apiClient = apiClient;
    this.authApi = options.authApi;
    AdminApi.active = this;
    AdminApi.attachInterceptors();
    this.apiClient.setConfig({
      baseUrl: options.baseUrl,
      throwOnError: true,
      responseStyle: 'data',
    });
  }

  registerTokenProvider(provider: AdminApiTokenProvider): void {
    this.tokenProvider = provider;
  }

  registerAuthHandlers(handlers: AdminApiAuthHandlers): void {
    this.authHandlers = handlers;
  }

  private static attachInterceptors(): void {
    if (AdminApi.interceptorsAttached) {
      return;
    }

    apiClient.interceptors.request.use(async (request) => {
      request.headers.set('Accept', 'application/json');

      if (!isAuthPath(request.url)) {
        const accessToken = AdminApi.active?.tokenProvider?.getAccessToken();
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      }

      return request;
    });

    apiClient.interceptors.response.use(async (response, request, options) => {
      if (response.status !== 401 || isAuthPath(request.url) || request.headers.get('X-Auth-Retry') === '1') {
        return response;
      }

      const active = AdminApi.active;
      if (!active) {
        return response;
      }

      const refreshed = await active.refreshTokensSingleFlight();
      if (!refreshed) {
        active.tokenProvider?.clearTokens();
        active.authHandlers?.onUnauthorized?.();
        return response;
      }

      const accessToken = active.tokenProvider?.getAccessToken();
      const headers = new Headers(request.headers);
      headers.set('X-Auth-Retry', '1');
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      } else {
        headers.delete('Authorization');
      }

      const fetchFn = options.fetch ?? globalThis.fetch;
      return await fetchFn(request.url, {
        method: options.method ?? request.method,
        headers,
        body: options.serializedBody,
        credentials: options.credentials ?? request.credentials,
      });
    });

    apiClient.interceptors.error.use((error, response) => toApiError(error, response));

    AdminApi.interceptorsAttached = true;
  }

  private refreshTokensSingleFlight(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = this.tokenProvider?.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const tokens = this.authHandlers?.refresh
        ? await this.authHandlers.refresh(refreshToken)
        : await this.defaultRefresh(refreshToken);

      this.tokenProvider?.setTokens(tokens);
      return true;
    } catch {
      return false;
    }
  }

  private async defaultRefresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await authControllerRefresh({
      body: { refreshToken },
      client: this.authApi.apiClient,
    });

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }
}

export { apiClient };
