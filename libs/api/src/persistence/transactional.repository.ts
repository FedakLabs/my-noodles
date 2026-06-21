import type { DataSource } from 'typeorm';

import { runInTransaction } from './transaction-context';

/** Framework-agnostic base for services that orchestrate DB transactions. */
export class TransactionalRepository {
  constructor(protected readonly dataSource: DataSource) {}

  protected withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return runInTransaction(this.dataSource, work);
  }
}
