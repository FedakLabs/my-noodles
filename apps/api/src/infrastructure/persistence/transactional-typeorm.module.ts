import { createContextAwareRepository } from '@my-noodles/api-lib/persistence';
import { DynamicModule, Module } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import type { DataSource } from 'typeorm';

/** Registers context-aware TypeORM repositories for the given entities. */
@Module({})
export class TransactionalTypeOrmModule {
  static forFeature(entities: EntityClassOrSchema[]): DynamicModule {
    const providers = entities.map((entity) => ({
      provide: getRepositoryToken(entity),
      useFactory: (dataSource: DataSource) => createContextAwareRepository(dataSource, entity),
      inject: [getDataSourceToken()],
    }));

    return {
      module: TransactionalTypeOrmModule,
      providers,
      exports: providers,
    };
  }
}
