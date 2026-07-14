import { formatApiClientLogTarget, resolveApiClientRequestUrl } from './api-client.utils';

describe('api-client.utils', () => {
  it('resolves base URL when request path is empty', () => {
    expect(
      resolveApiClientRequestUrl({ method: 'post', url: '' }, 'https://api.novaposhta.ua/v2.0/json'),
    ).toBe('https://api.novaposhta.ua/v2.0/json');
  });

  it('formats log target with operation suffix when present', () => {
    expect(
      formatApiClientLogTarget(
        {
          method: 'post',
          url: '',
          operation: 'searchSettlements',
          data: {
            calledMethod: 'searchSettlements',
            methodProperties: { CityName: 'Дні', Limit: '20', Page: '1' },
          },
        },
        'https://api.novaposhta.ua/v2.0/json',
      ),
    ).toBe('https://api.novaposhta.ua/v2.0/json::searchSettlements');
  });

  it('formats log target as URL only when operation is omitted', () => {
    expect(
      formatApiClientLogTarget({ method: 'get', url: '/branches' }, 'https://publicapi.meest.com/v3.0'),
    ).toBe('https://publicapi.meest.com/v3.0/branches');
  });
});
