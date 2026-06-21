import { TransactionalRepository as TransactionalRepositoryBase } from '@my-noodles/api-lib/persistence';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';

/**
 * Nest DI wrapper around `@my-noodles/api-lib/persistence` `TransactionalRepository`.
 * Extend this in services that use `@InjectRepository` repos from `TransactionalTypeOrmModule`.
 */
@Injectable()
export abstract class TransactionalRepository extends TransactionalRepositoryBase {
  protected constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource);
  }
}
