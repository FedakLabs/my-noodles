import { jest } from '@jest/globals';

import { createContextAwareRepository } from './context-aware-repository';
import { runInTransaction } from './transaction-context';

class StubEntity {
  id!: string;
}

describe('createContextAwareRepository', () => {
  it('uses the default manager outside a transaction', async () => {
    const defaultSave = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const transactionSave = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const dataSource = {
      transaction: jest.fn(),
      manager: {
        getRepository: () => ({ save: defaultSave }),
      },
    } as never;

    const repository = createContextAwareRepository(dataSource, StubEntity);
    await repository.save({ id: 'order-1' });

    expect(defaultSave).toHaveBeenCalledTimes(1);
    expect(transactionSave).not.toHaveBeenCalled();
  });

  it('uses the transaction manager inside withTransaction', async () => {
    const defaultSave = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const transactionSave = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const dataSource = {
      transaction: jest.fn(
        async (callback: (manager: unknown) => Promise<unknown>) =>
          await callback({
            getRepository: () => ({ save: transactionSave }),
          }),
      ),
      manager: {
        getRepository: () => ({ save: defaultSave }),
      },
    } as never;

    const repository = createContextAwareRepository(dataSource, StubEntity);

    await runInTransaction(dataSource, async () => {
      await repository.save({ id: 'order-1' });
    });

    expect(transactionSave).toHaveBeenCalledTimes(1);
    expect(defaultSave).not.toHaveBeenCalled();
  });
});
