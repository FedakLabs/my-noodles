import type { DataSource } from 'typeorm';

import { DatabaseRetry } from './database-retry';
import { isPostgresReadOnlySql, PostgresTypeOrmResilience } from './postgres-typeorm-resilience';

describe('isPostgresReadOnlySql', () => {
  it.each([
    'SELECT 1',
    '  SELECT * FROM products',
    '-- comment\nSELECT 1',
    '/* comment */ SHOW server_version',
  ])('accepts read-only statement: %s', (sql) => {
    expect(isPostgresReadOnlySql(sql)).toBe(true);
  });

  it.each([
    'INSERT INTO products (id) VALUES ($1)',
    'UPDATE products SET available = false',
    'DELETE FROM products',
    'WITH changed AS (UPDATE products SET available = false RETURNING id) SELECT * FROM changed',
    'BEGIN',
    'CREATE TABLE products (id uuid)',
    'EXPLAIN ANALYZE SELECT 1',
  ])('rejects replay-unsafe statement: %s', (sql) => {
    expect(isPostgresReadOnlySql(sql)).toBe(false);
  });

  it('rejects empty or incomplete SQL', () => {
    expect(isPostgresReadOnlySql(undefined)).toBe(false);
    expect(isPostgresReadOnlySql('/* never closed')).toBe(false);
  });
});

describe('PostgresTypeOrmResilience', () => {
  class TestQueryRunner {
    isTransactionActive = false;
    readonly queryMock = jest.fn<Promise<unknown>, unknown[]>();
    readonly release = jest.fn().mockResolvedValue(undefined);

    query(...args: unknown[]): Promise<unknown> {
      return this.queryMock(...args);
    }
  }

  function createDataSource(runner: TestQueryRunner): DataSource {
    return {
      driver: {
        obtainMasterConnection: jest.fn().mockResolvedValue({}),
      },
      createQueryRunner: jest.fn().mockReturnValue(runner),
    } as unknown as DataSource;
  }

  it('retries transient read failures but not writes', async () => {
    const runner = new TestQueryRunner();
    const transient = Object.assign(new Error('wake'), { code: '57P01' });
    runner.queryMock
      .mockRejectedValueOnce(transient)
      .mockResolvedValueOnce('read-result')
      .mockRejectedValueOnce(transient);
    const dataSource = createDataSource(runner);

    await new PostgresTypeOrmResilience(new DatabaseRetry({ minDelayMs: 0 })).install(dataSource);

    await expect(runner.query('SELECT 1')).resolves.toBe('read-result');
    await expect(runner.query('UPDATE products SET available = false')).rejects.toBe(transient);
    expect(runner.queryMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry a query inside a transaction', async () => {
    const runner = new TestQueryRunner();
    runner.isTransactionActive = true;
    const transient = Object.assign(new Error('wake'), { code: '57P01' });
    runner.queryMock.mockRejectedValue(transient);
    const dataSource = createDataSource(runner);

    await new PostgresTypeOrmResilience(new DatabaseRetry({ minDelayMs: 0 })).install(dataSource);

    await expect(runner.query('SELECT 1')).rejects.toBe(transient);
    expect(runner.queryMock).toHaveBeenCalledTimes(1);
  });

  it('does not install wrappers twice', async () => {
    const runner = new TestQueryRunner();
    runner.queryMock.mockResolvedValue('ok');
    const dataSource = createDataSource(runner);
    const resilience = new PostgresTypeOrmResilience(new DatabaseRetry({ minDelayMs: 0 }));

    await resilience.install(dataSource);
    const wrappedQuery = Object.getPrototypeOf(runner).query;
    await resilience.install(dataSource);

    expect(Object.getPrototypeOf(runner).query).toBe(wrappedQuery);
  });
});
