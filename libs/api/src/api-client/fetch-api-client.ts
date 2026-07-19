import { ApiClient, type ApiClientRequestConfig } from './api-client';

/**
 * Fetch-shaped outbound adapter for generated clients.
 * Maps fetch args onto {@link ApiClient.request} so logging, throw on !ok,
 * and assertResponseOk stay in one place. Pass `this.fetch` into `createClient({ fetch })`.
 */
export abstract class FetchApiClient extends ApiClient {
  readonly fetch: typeof globalThis.fetch = async (input, init) => {
    const body = await this.request<unknown>(await this.toRequestConfig(input, init));
    return this.toFetchResponse(body);
  };

  private async toRequestConfig(
    input: Parameters<typeof globalThis.fetch>[0],
    init?: RequestInit,
  ): Promise<ApiClientRequestConfig> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const headers =
      this.normalizeHeaders(init?.headers) ??
      (input instanceof Request ? this.normalizeHeaders(input.headers) : undefined);

    let data: unknown;
    if (init?.body !== undefined) {
      data = init.body;
    } else if (input instanceof Request && input.body) {
      // hey-api passes a Request; body must be read before we rebuild the outbound call.
      data = await input.text();
    }

    return { url, method, headers, data };
  }

  private normalizeHeaders(
    headers?: NonNullable<RequestInit['headers']>,
  ): Record<string, string> | undefined {
    if (headers === undefined) {
      return undefined;
    }

    if (headers instanceof Headers) {
      const result: Record<string, string> = {};
      headers.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }

    if (Array.isArray(headers)) {
      return Object.fromEntries(headers);
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (value === undefined) {
        continue;
      }
      result[key] = typeof value === 'string' ? value : value.join(', ');
    }
    return result;
  }

  private toFetchResponse(body: unknown): Response {
    if (body === undefined) {
      return new Response(null, { status: 200 });
    }

    if (typeof body === 'string') {
      return new Response(body, { status: 200 });
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
}
