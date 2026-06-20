import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';

import { runInTransaction } from './transaction-context';

/**
 * Base for services that orchestrate DB transactions.
 * Extend this class and use `@InjectRepository` repos registered via
 * `TransactionalTypeOrmModule.forFeature` — they join the active tx automatically.
 */
@Injectable()
export abstract class TransactionalRepository {
  @InjectDataSource()
  protected readonly dataSource!: DataSource;

  protected constructor() {}

  protected withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return runInTransaction(this.dataSource, work);
  }
}
