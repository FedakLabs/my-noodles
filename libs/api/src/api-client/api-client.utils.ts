export type ApiClientRequestConfig = {
  url?: string;
  method?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  data?: unknown;
  /** Optional label for logs / urlPattern when the HTTP path alone is not descriptive (e.g. a single RPC-style endpoint). */
  operation?: string;
};

export function resolveApiClientRequestUrl(
  config: ApiClientRequestConfig | undefined,
  fallbackBaseUrl?: string,
): string {
  if (!config) {
    return '-';
  }

  const path = config.url ?? '';
  const baseUrl = fallbackBaseUrl ?? '';

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

export function formatApiClientLogTarget(
  config: ApiClientRequestConfig | undefined,
  fallbackBaseUrl?: string,
): string {
  const url = resolveApiClientRequestUrl(config, fallbackBaseUrl);
  const operation = config?.operation;

  return operation ? `${url}::${operation}` : url;
}

export function buildApiClientUrl(
  baseUrl: string,
  path: string | undefined,
  params?: ApiClientRequestConfig['params'],
): string {
  const resolved = resolveApiClientRequestUrl({ url: path ?? '' }, baseUrl);
  if (!params) {
    return resolved;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
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
