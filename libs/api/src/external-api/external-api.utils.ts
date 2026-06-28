import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

type RequestConfig = InternalAxiosRequestConfig | AxiosRequestConfig | undefined;

export function resolveExternalApiRequestUrl(config: RequestConfig, fallbackBaseUrl?: string): string {
  if (!config) {
    return '-';
  }

  const path = config.url ?? '';
  const baseUrl = config.baseURL ?? fallbackBaseUrl ?? '';

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

export function extractRpcMethodFromBody(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null || !('calledMethod' in data)) {
    return undefined;
  }

  const calledMethod = (data as { calledMethod?: unknown }).calledMethod;

  return typeof calledMethod === 'string' && calledMethod.length > 0 ? calledMethod : undefined;
}

export function formatExternalApiLogTarget(config: RequestConfig, fallbackBaseUrl?: string): string {
  const url = resolveExternalApiRequestUrl(config, fallbackBaseUrl);
  const rpcMethod = extractRpcMethodFromBody(config?.data);

  return rpcMethod ? `${url}::${rpcMethod}` : url;
}
