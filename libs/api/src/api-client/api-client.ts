import { context, trace } from '@opentelemetry/api';
import type { Logger } from 'winston';

import { ApiClientException } from './api-client.exceptions';
import {
  type ApiClientRequestConfig,
  buildApiClientUrl,
  formatApiClientLogTarget,
  resolveApiClientRequestUrl,
} from './api-client.utils';

const tracer = trace.getTracer('my-noodles/api-client');

function safeJsonStringify(value: unknown): string {
  if (value === undefined) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch {
    return typeof value === 'string' ? value : '[unserializable]';
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
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

export abstract class ApiClient {
  protected readonly logger: Logger;

  protected constructor(logger: Logger) {
    this.logger = logger;
  }

  protected get serviceName(): string {
    return this.constructor.name;
  }

  protected abstract getBaseUrl(): string;

  private buildHttpMetadata(params: {
    config: ApiClientRequestConfig;
    execTimeMs: number;
    responseStatus?: number;
    responseBody?: unknown;
  }) {
    const { config, execTimeMs, responseStatus, responseBody } = params;
    const fallbackBaseUrl = this.getBaseUrl();

    return {
      requestType: 'outgoing' as const,
      method: config.method?.toUpperCase() ?? 'GET',
      url: resolveApiClientRequestUrl(config, fallbackBaseUrl),
      urlPattern: config.url && config.url.length > 0 ? config.url : (config.operation ?? '-'),
      queryParams: safeJsonStringify(config.params),
      requestBody: safeJsonStringify(config.data),
      responseStatus,
      responseBody: safeJsonStringify(responseBody),
      execTime: Math.round(execTimeMs),
    };
  }

  protected async request<T>(requestConfig: ApiClientRequestConfig): Promise<T> {
    const method = (requestConfig.method ?? 'GET').toUpperCase();
    const config: ApiClientRequestConfig = { ...requestConfig, method };
    const requestUrl = buildApiClientUrl(this.getBaseUrl(), config.url, config.params);
    const startTime = performance.now();
    const span = tracer.startSpan('http.client', {
      attributes: {
        'http.method': method,
        'http.url': requestUrl,
      },
    });

    try {
      return await context.with(trace.setSpan(context.active(), span), async () => {
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
          const execTimeMs = performance.now() - startTime;
          const message = error instanceof Error ? error.message : String(error);

          span.recordException(error instanceof Error ? error : new Error(message));

          this.logger.error(
            `${this.serviceName}::${method}::${formatApiClientLogTarget(config, this.getBaseUrl())}::error`,
            {
              http: this.buildHttpMetadata({ config, execTimeMs }),
            },
          );

          throw new ApiClientException(message);
        }

        const responseBody = await parseResponseBody(response);
        const execTimeMs = performance.now() - startTime;

        span.setAttributes({
          'http.status_code': response.status,
        });

        if (!response.ok) {
          const message =
            typeof responseBody === 'object' &&
            responseBody !== null &&
            'message' in responseBody &&
            typeof (responseBody as { message?: unknown }).message === 'string'
              ? (responseBody as { message: string }).message
              : `Request failed with status ${response.status}`;

          span.recordException(new Error(message));

          this.logger.error(
            `${this.serviceName}::${method}::${formatApiClientLogTarget(config, this.getBaseUrl())}::error`,
            {
              http: this.buildHttpMetadata({
                config,
                execTimeMs,
                responseStatus: response.status,
                responseBody,
              }),
            },
          );

          throw new ApiClientException(message, response.status, responseBody);
        }

        this.logger.info(
          `${this.serviceName}::${method}::${formatApiClientLogTarget(config, this.getBaseUrl())}`,
          {
            http: this.buildHttpMetadata({
              config,
              execTimeMs,
              responseStatus: response.status,
              responseBody,
            }),
          },
        );

        return responseBody as T;
      });
    } finally {
      span.end();
    }
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
}
