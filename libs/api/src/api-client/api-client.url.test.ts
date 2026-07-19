import { ApiClient, type ApiClientRequestConfig } from './api-client';

class UrlTestClient extends ApiClient {
  constructor(private readonly baseUrl: string) {
    super();
  }

  protected getBaseUrl(): string {
    return this.baseUrl;
  }

  resolve(config: ApiClientRequestConfig) {
    return this.resolveRequestUrl(config);
  }

  build(config: ApiClientRequestConfig) {
    return this.buildRequestUrl(config);
  }
}

describe('ApiClient URL helpers', () => {
  it('resolves base URL when request path is empty', () => {
    const client = new UrlTestClient('https://api.novaposhta.ua/v2.0/json');
    expect(client.resolve({ method: 'post', url: '' })).toBe('https://api.novaposhta.ua/v2.0/json');
  });

  it('joins base URL and path', () => {
    const client = new UrlTestClient('https://publicapi.meest.com/v3.0');
    expect(client.resolve({ method: 'get', url: '/branches' })).toBe(
      'https://publicapi.meest.com/v3.0/branches',
    );
  });

  it('appends query params when building the request URL', () => {
    const client = new UrlTestClient('https://example.com');
    expect(client.build({ url: '/items', params: { limit: 10, offset: 0 } })).toBe(
      'https://example.com/items?limit=10&offset=0',
    );
  });

  it('passes through absolute request URLs without joining the base', () => {
    const client = new UrlTestClient('https://example.com');
    expect(client.resolve({ url: 'https://other.example/v1/items' })).toBe('https://other.example/v1/items');
  });
});
