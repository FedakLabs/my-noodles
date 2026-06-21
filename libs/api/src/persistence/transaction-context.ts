import { AsyncLocalStorage } from 'node:async_hooks';

import type { DataSource, EntityManager } from 'typeorm';

const activeManagerStorage = new AsyncLocalStorage<EntityManager>();

/** EntityManager bound to the current async call chain, if inside `runInTransaction`. */
export function getActiveEntityManager(dataSource: DataSource): EntityManager {
  return activeManagerStorage.getStore() ?? dataSource.manager;
}

/**
 * Runs `work` inside a DB transaction. Nested calls reuse the outer transaction
 * instead of opening a new one.
 */
export function runInTransaction<T>(dataSource: DataSource, work: () => Promise<T>): Promise<T> {
  const activeManager = activeManagerStorage.getStore();
  if (activeManager) {
    return work();
  }

  return dataSource.transaction((manager) => activeManagerStorage.run(manager, work));
}
