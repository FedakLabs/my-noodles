import {
  extractRpcMethodFromBody,
  formatExternalApiLogTarget,
  resolveExternalApiRequestUrl,
} from './external-api.utils';

describe('external-api.utils', () => {
  it('resolves base URL when request path is empty', () => {
    expect(
      resolveExternalApiRequestUrl({ method: 'post', url: '' }, 'https://api.novaposhta.ua/v2.0/json'),
    ).toBe('https://api.novaposhta.ua/v2.0/json');
  });

  it('formats RPC log target with calledMethod suffix', () => {
    expect(
      formatExternalApiLogTarget(
        {
          method: 'post',
          url: '',
          data: {
            calledMethod: 'searchSettlements',
            methodProperties: { CityName: 'Дні', Limit: '20', Page: '1' },
          },
        },
        'https://api.novaposhta.ua/v2.0/json',
      ),
    ).toBe('https://api.novaposhta.ua/v2.0/json::searchSettlements');
  });

  it('extracts calledMethod from JSON-RPC style body', () => {
    expect(extractRpcMethodFromBody({ calledMethod: 'getWarehouses' })).toBe('getWarehouses');
    expect(extractRpcMethodFromBody({ modelName: 'Address' })).toBeUndefined();
  });
});
