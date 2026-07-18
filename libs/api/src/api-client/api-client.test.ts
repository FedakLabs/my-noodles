import { logger } from '../logger';
import { ApiClient } from './api-client';
import { ApiClientException } from './api-client.exceptions';

class TestApiClient extends ApiClient {
  protected getBaseUrl(): string {
    return 'https://example.com';
  }

  getJson(path: string) {
    return this.get<{ ok: boolean }>({ url: path });
  }

  postJson(path: string, data: unknown, operation?: string) {
    return this.post<{ ok: boolean }>({ url: path, data, operation });
  }
}

describe('ApiClient logging', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('emits one outgoing INFO manifest record on success', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
    }) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    const client = new TestApiClient();
    await client.getJson('/health');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();

    const record = infoSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(record['attributes.http.requestType']).toBe('outgoing');
    expect(record['attributes.http.method']).toBe('GET');
    expect(record['attributes.http.responseStatus']).toBe('200');
    expect(record['attributes.http.service']).toBe('TestApiClient');
    expect(record['severity.text']).toBe('INFO');
    expect(String(record.body)).toContain('GET 200');
  });

  it('emits one outgoing INFO manifest record for upstream 4xx', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ message: 'Not found' }),
    }) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    const client = new TestApiClient();
    await expect(client.getJson('/missing')).rejects.toBeInstanceOf(ApiClientException);

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();

    const record = infoSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(record['severity.text']).toBe('INFO');
    expect(record['attributes.http.responseStatus']).toBe('404');
    expect(record['attributes.http.requestType']).toBe('outgoing');
  });

  it('emits one outgoing ERROR manifest record when assertResponseOk fails on HTTP 200', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: false, errors: ['FindByString is not specified'] }),
    }) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    class RpcClient extends ApiClient {
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
          throw new ApiClientException('FindByString is not specified', status, body);
        }
      }

      call() {
        return this.post<unknown>({ url: '', data: { a: 1 }, operation: 'getCities' });
      }
    }

    const client = new RpcClient();
    await expect(client.call()).rejects.toBeInstanceOf(ApiClientException);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();

    const record = errorSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(record['severity.text']).toBe('ERROR');
    expect(record['attributes.http.responseStatus']).toBe('200');
    expect(record['attributes.error.message']).toBe('FindByString is not specified');
  });

  it('emits one outgoing ERROR manifest record on network failure', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('fetch failed')) as unknown as typeof fetch;

    const infoSpy = jest.spyOn(logger, 'info').mockImplementation((() => logger) as never);
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation((() => logger) as never);

    class RpcClient extends ApiClient {
      protected getBaseUrl(): string {
        return 'https://example.com/rpc';
      }

      call() {
        return this.post<unknown>({ url: '', data: { a: 1 }, operation: 'doThing' });
      }
    }

    const client = new RpcClient();
    await expect(client.call()).rejects.toBeInstanceOf(ApiClientException);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).not.toHaveBeenCalled();

    const record = errorSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(record['severity.text']).toBe('ERROR');
    expect(record['attributes.http.requestType']).toBe('outgoing');
    expect(record['attributes.http.responseStatus']).toBeUndefined();
    expect(record['attributes.error.message']).toBe('fetch failed');
    expect(String(record.body)).toContain('POST -');
  });
});
