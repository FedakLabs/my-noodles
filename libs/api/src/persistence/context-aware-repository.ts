import type { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { getActiveEntityManager } from './transaction-context';

/**
 * Repository proxy that resolves against the active transaction manager when
 * `runInTransaction` is running, otherwise the default DataSource manager.
 */
export function createContextAwareRepository<Entity extends ObjectLiteral>(
  dataSource: DataSource,
  entity: EntityTarget<Entity>,
): Repository<Entity> {
  const resolveRepository = (): Repository<Entity> =>
    getActiveEntityManager(dataSource).getRepository(entity);

  return new Proxy({} as Repository<Entity>, {
    get(_target, property, receiver) {
      if (property === 'manager') {
        return getActiveEntityManager(dataSource);
      }

      const repository = resolveRepository();
      const value: unknown = Reflect.get(repository, property, receiver);

      if (typeof value === 'function') {
        return (value as (...args: unknown[]) => unknown).bind(repository);
      }

      return value;
    },
  });
}
