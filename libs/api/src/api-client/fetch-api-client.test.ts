import { logger } from '../logger';
import { ApiClientException } from './api-client.exceptions';
import { FetchApiClient } from './fetch-api-client';

class TestFetchApiClient extends FetchApiClient {
  protected getBaseUrl(): string {
    return 'https://example.com';
  }
}

describe('FetchApiClient.fetch', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns a readable Response and emits one INFO log on success', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ ok: true }),
    }) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    const client = new TestFetchApiClient();
    const response = await client.fetch('/health');

    expect(response).toBeInstanceOf(Response);
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();

    const record = infoSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(record['attributes.http.service']).toBe('TestFetchApiClient');
    expect(record['attributes.http.responseStatus']).toBe('200');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.com/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('throws ApiClientException on HTTP !ok', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      text: async () => JSON.stringify({ message: 'Not found' }),
    }) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    const client = new TestFetchApiClient();
    const error = await client.fetch('/missing').catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiClientException);
    expect(error).toMatchObject({
      status: 404,
      message: 'Not found',
      payload: null,
      internal: { message: 'Not found' },
    });
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('throws when assertResponseOk fails on HTTP 200', async () => {
    const responseBody = { success: false, errors: ['FindByString is not specified'] };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => JSON.stringify(responseBody),
    }) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    class RpcClient extends FetchApiClient {
      protected getBaseUrl(): string {
        return 'https://example.com/rpc';
      }

      protected override assertResponseOk(body: unknown, status: number): void {
        if (
          typeof body === 'object' &&
          body !== null &&
          'success' in body &&
          (body as { success: unknown }).success === false
        ) {
          throw new ApiClientException({
            message: 'FindByString is not specified',
            status,
            internal: body,
          });
        }
      }
    }

    const client = new RpcClient();
    const error = await client.fetch('', { method: 'POST', body: '{"a":1}' }).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiClientException);
    expect(error).toMatchObject({
      status: 200,
      message: 'FindByString is not specified',
      payload: null,
      internal: responseBody,
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('throws ApiClientException on network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('fetch failed')) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    const client = new TestFetchApiClient();
    const error = await client.fetch('/health').catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiClientException);
    expect(error).toMatchObject({
      status: 502,
      message: 'fetch failed',
      payload: null,
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('keeps this bound when passed as an unbound callback', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => JSON.stringify({ ok: true }),
    }) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);

    const client = new TestFetchApiClient();
    const { fetch } = client;
    await fetch('/health');

    const record = infoSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(record['attributes.http.service']).toBe('TestFetchApiClient');
  });

  it('forwards body when hey-api passes a Request instance', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => JSON.stringify({ status: 'OK' }),
    }) as unknown as typeof fetch;

    jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);

    const client = new TestFetchApiClient();
    const request = new Request('https://example.com/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'u', password: 'p' }),
    });

    await client.fetch(request);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.com/auth',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'u', password: 'p' }),
      }),
    );
  });
});
