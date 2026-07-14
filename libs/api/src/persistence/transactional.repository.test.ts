import { jest } from '@jest/globals';

import { TransactionalRepository } from './transactional.repository';

class TestTransactionalRepository extends TransactionalRepository {
  run<T>(work: () => Promise<T>): Promise<T> {
    return this.withTransaction(work);
  }
}

describe('TransactionalRepository', () => {
  it('delegates withTransaction to runInTransaction', async () => {
    const transaction = jest.fn(async (callback: () => Promise<unknown>) => callback());
    const dataSource = { transaction } as never;
    const repository = new TestTransactionalRepository(dataSource);

    const result = await repository.run(() => Promise.resolve('done'));

    expect(result).toBe('done');
    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
