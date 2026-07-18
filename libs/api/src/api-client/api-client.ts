import { buildOutgoingHttpManifestLog, emitHttpManifestLog, logger } from '../logger';
import { safeJsonStringify } from '../utils/safe-json-stringify';
import { ApiClientException } from './api-client.exceptions';
import { getTimingElapsedMs, markTimingStart } from './request-timing';

export type ApiClientRequestConfig = {
  url?: string;
  method?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  data?: unknown;
  /** Optional label for logs when the HTTP path alone is not descriptive (e.g. RPC-style endpoints). */
  operation?: string;
};

export abstract class ApiClient {
  protected readonly logger = logger;

  protected get serviceName(): string {
    return this.constructor.name;
  }

  protected abstract getBaseUrl(): string;

  protected assertResponseOk(_body: unknown, _status: number): void {}

  protected async request<T>(requestConfig: ApiClientRequestConfig): Promise<T> {
    const method = (requestConfig.method ?? 'GET').toUpperCase();
    const config: ApiClientRequestConfig = { ...requestConfig, method };
    const requestUrl = this.buildRequestUrl(config);
    markTimingStart(config);

    const init: RequestInit = {
      method,
      headers: config.headers,
    };

    if (config.data !== undefined && method !== 'GET' && method !== 'HEAD') {
      init.body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    }

    let response: Response;
    try {
      response = await fetch(requestUrl, init);
    } catch (error) {
      this.logOutgoing({
        config,
        url: this.resolveRequestUrl(config),
        execTimeMs: getTimingElapsedMs(config),
        error,
      });

      throw new ApiClientException(this.resolveErrorMessage(error));
    }

    const responseBody = await this.parseResponseBody(response);
    const execTimeMs = getTimingElapsedMs(config);

    if (!response.ok) {
      this.logOutgoing({
        config,
        url: requestUrl,
        execTimeMs,
        responseStatus: response.status,
        responseBody,
        error: responseBody,
      });

      throw new ApiClientException(
        this.resolveErrorMessage(responseBody, response.status),
        response.status,
        responseBody,
      );
    }

    try {
      this.assertResponseOk(responseBody, response.status);
    } catch (error) {
      this.logOutgoing({
        config,
        url: requestUrl,
        execTimeMs,
        responseStatus: response.status,
        responseBody,
        error,
      });

      throw error instanceof ApiClientException
        ? error
        : new ApiClientException(this.resolveErrorMessage(error), response.status, responseBody);
    }

    this.logOutgoing({
      config,
      url: requestUrl,
      execTimeMs,
      responseStatus: response.status,
      responseBody,
    });

    return responseBody as T;
  }

  protected get<T>(params: ApiClientRequestConfig) {
    return this.request<T>({ ...params, method: 'GET' });
  }

  protected post<T>(params: ApiClientRequestConfig) {
    return this.request<T>({ ...params, method: 'POST' });
  }

  protected put<T>(params: ApiClientRequestConfig) {
    return this.request<T>({ ...params, method: 'PUT' });
  }

  protected patch<T>(params: ApiClientRequestConfig) {
    return this.request<T>({ ...params, method: 'PATCH' });
  }

  protected delete<T>(params: ApiClientRequestConfig) {
    return this.request<T>({ ...params, method: 'DELETE' });
  }

  /** Absolute URL for the request (base + path), without query params. */
  protected resolveRequestUrl(config: ApiClientRequestConfig): string {
    const path = config.url ?? '';
    const baseUrl = this.getBaseUrl();

    if (!path) {
      return baseUrl || '-';
    }

    if (!baseUrl) {
      return path;
    }

    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}`;
  }

  /** Absolute URL including query params from `config.params`. */
  protected buildRequestUrl(config: ApiClientRequestConfig): string {
    const resolved = this.resolveRequestUrl(config);
    if (!config.params) {
      return resolved;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(config.params)) {
      if (value === undefined || value === null) {
        continue;
      }
      searchParams.set(key, String(value));
    }

    const query = searchParams.toString();
    if (!query) {
      return resolved;
    }

    return resolved.includes('?') ? `${resolved}&${query}` : `${resolved}?${query}`;
  }

  private logOutgoing(params: {
    config: ApiClientRequestConfig;
    url: string;
    execTimeMs: number;
    responseStatus?: number;
    responseBody?: unknown;
    error?: unknown;
  }): void {
    const { config, url, execTimeMs, responseStatus, responseBody, error } = params;
    const queryIndex = url.indexOf('?');
    const queryParams = queryIndex === -1 ? '' : url.slice(queryIndex + 1);
    const requestBody =
      config.data !== undefined && config.method !== 'GET' && config.method !== 'HEAD'
        ? safeJsonStringify(config.data)
        : undefined;
    const normalizedError =
      error === undefined
        ? undefined
        : error instanceof Error
          ? error
          : new Error(this.resolveErrorMessage(error, responseStatus));

    emitHttpManifestLog(
      this.logger,
      buildOutgoingHttpManifestLog({
        method: config.method?.toUpperCase() ?? 'GET',
        url,
        queryParams,
        requestBody: requestBody && requestBody.length > 0 ? requestBody : undefined,
        responseStatus,
        responseBody,
        execTimeMs,
        error: normalizedError,
        serviceName: this.serviceName,
      }),
    );
  }

  private resolveErrorMessage(source: unknown, status?: number): string {
    if (source instanceof Error) {
      return source.message;
    }

    if (
      typeof source === 'object' &&
      source !== null &&
      'message' in source &&
      typeof (source as { message?: unknown }).message === 'string'
    ) {
      return (source as { message: string }).message;
    }

    if (status !== undefined) {
      return `Request failed with status ${status}`;
    }

    return String(source);
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
}
