import { Config } from '../config';
import { validConfigOptions } from '../tests/fixtures/env';
import { prepareDataSource } from './data-source';

describe('prepareDataSource', () => {
  it('always creates PostgreSQL datasource options', () => {
    const config = new Config('/tmp/my-noodles-api/src', () => validConfigOptions);

    expect(prepareDataSource(config).type).toBe('postgres');
  });
});
