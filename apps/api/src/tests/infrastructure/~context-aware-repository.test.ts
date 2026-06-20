import { Order } from '@/application/orders';
import { createContextAwareRepository, runInTransaction } from '@/infrastructure/persistence';

import { jest } from '../jest-globals';

describe('createContextAwareRepository', () => {
  it('uses the default manager outside a transaction', async () => {
    const defaultSave = jest.fn().mockResolvedValue(undefined);
    const transactionSave = jest.fn().mockResolvedValue(undefined);
    const dataSource = {
      transaction: jest.fn(),
      manager: {
        getRepository: () => ({ save: defaultSave }),
      },
    } as never;

    const repository = createContextAwareRepository(dataSource, Order);
    await repository.save({ id: 'order-1' } as never);

    expect(defaultSave).toHaveBeenCalledTimes(1);
    expect(transactionSave).not.toHaveBeenCalled();
  });

  it('uses the transaction manager inside withTransaction', async () => {
    const defaultSave = jest.fn().mockResolvedValue(undefined);
    const transactionSave = jest.fn().mockResolvedValue(undefined);
    const dataSource = {
      transaction: jest.fn(async (callback: (manager: unknown) => Promise<unknown>) =>
        callback({
          getRepository: () => ({ save: transactionSave }),
        }),
      ),
      manager: {
        getRepository: () => ({ save: defaultSave }),
      },
    } as never;

    const repository = createContextAwareRepository(dataSource, Order);

    await runInTransaction(dataSource, async () => {
      await repository.save({ id: 'order-1' } as never);
    });

    expect(transactionSave).toHaveBeenCalledTimes(1);
    expect(defaultSave).not.toHaveBeenCalled();
  });
});
