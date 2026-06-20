import { runInTransaction } from '@/infrastructure/persistence';

import { jest } from '../jest-globals';

describe('runInTransaction', () => {
  it('starts a transaction when none is active', async () => {
    const transaction = jest.fn((callback: (manager: { id: string }) => Promise<unknown>) =>
      callback({ id: 'outer-manager' }),
    );
    const dataSource = { transaction, manager: { id: 'default-manager' } } as never;

    const result = await runInTransaction(dataSource, () => Promise.resolve('done'));

    expect(result).toBe('done');
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('reuses the active transaction on nested calls', async () => {
    const transaction = jest.fn((callback: (manager: { id: string }) => Promise<unknown>) =>
      callback({ id: 'outer-manager' }),
    );
    const dataSource = { transaction, manager: { id: 'default-manager' } } as never;

    await runInTransaction(dataSource, () =>
      Promise.all([
        runInTransaction(dataSource, () => Promise.resolve(undefined)),
        runInTransaction(dataSource, () => Promise.resolve(undefined)),
      ]).then(() => undefined),
    );

    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
