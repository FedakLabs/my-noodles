import { Logger } from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method,
} from 'axios';

import { ExternalApiException } from './external-api.exceptions';

const tracer = trace.getTracer('my-noodles-api/external-api');

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

export abstract class ExternalApi {
  protected readonly logger: Logger;
  private axiosInstance?: AxiosInstance;

  protected constructor(protected readonly serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  protected abstract getBaseUrl(): string;

  private get axios(): AxiosInstance {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({ baseURL: this.getBaseUrl() });
      this.decorateAxiosInstance(this.axiosInstance, this.serviceName);
    }

    return this.axiosInstance;
  }

  private decorateAxiosInstance(axiosInstance: AxiosInstance, serviceName: string): void {
    const originalRequest = axiosInstance.request.bind(axiosInstance);

    axiosInstance.request = async <T = unknown, R = AxiosResponse<T>, D = unknown>(
      config: AxiosRequestConfig<D>,
    ): Promise<R> => {
      const startTime = performance.now();
      const span = tracer.startSpan('http.client', {
        attributes: {
          'http.method': config.method?.toUpperCase() ?? 'GET',
          'http.url': `${config.baseURL ?? ''}${config.url ?? ''}`,
        },
      });

      try {
        return await context.with(trace.setSpan(context.active(), span), async () => {
          const response = (await originalRequest<T, R, D>(config)) as AxiosResponse<T>;
          const execTimeMs = performance.now() - startTime;

          span.setAttributes({
            'http.status_code': response.status,
          });

          this.logger.log(`${serviceName}::${response.config.method}::${response.config.url}`, {
            http: this.buildHttpMetadata({ config: response.config, execTimeMs, response }),
          });

          return response as R;
        });
      } catch (error) {
        const execTimeMs = performance.now() - startTime;
        const axiosConfig = axios.isAxiosError(error) ? error.config : config;

        span.recordException(error instanceof Error ? error : new Error(String(error)));

        this.logger.error(`${serviceName}::${axiosConfig?.method}::${axiosConfig?.url}::error`, {
          http: this.buildHttpMetadata({
            config: axiosConfig,
            execTimeMs,
            response: axios.isAxiosError(error) ? error.response : undefined,
          }),
        });

        if (axios.isAxiosError(error)) {
          throw new ExternalApiException(error.message, error.response?.status, error.response?.data);
        }

        throw error;
      } finally {
        span.end();
      }
    };
  }

  private buildHttpMetadata(params: {
    config: InternalAxiosRequestConfig | AxiosRequestConfig | undefined;
    execTimeMs: number;
    response?: AxiosResponse;
  }) {
    const { config, execTimeMs, response } = params;

    return {
      requestType: 'outgoing' as const,
      method: config?.method?.toUpperCase() ?? 'GET',
      url: config?.baseURL ? `${config.baseURL}${config.url ?? ''}` : (config?.url ?? ''),
      urlPattern: config?.url ?? '-',
      queryParams: safeJsonStringify(config?.params),
      requestBody: safeJsonStringify(config?.data),
      responseStatus: response?.status,
      responseBody: safeJsonStringify(response?.data),
      execTime: Math.round(execTimeMs),
    };
  }

  protected async request<T>(requestConfig: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axios.request<T>({
      method: 'GET',
      ...requestConfig,
    });
  }

  protected async call<T>(method: Method, params: AxiosRequestConfig): Promise<T> {
    const { data } = await this.request<T>({ ...params, method });
    return data;
  }

  protected get<T>(params: AxiosRequestConfig) {
    return this.call<T>('GET', params);
  }

  protected post<T>(params: AxiosRequestConfig) {
    return this.call<T>('POST', params);
  }

  protected put<T>(params: AxiosRequestConfig) {
    return this.call<T>('PUT', params);
  }

  protected patch<T>(params: AxiosRequestConfig) {
    return this.call<T>('PATCH', params);
  }

  protected delete<T>(params: AxiosRequestConfig) {
    return this.call<T>('DELETE', params);
  }
}
