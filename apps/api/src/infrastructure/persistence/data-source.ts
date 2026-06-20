import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

import type { Config } from '@/config';

export function prepareDataSource(appConfig: Config): DataSourceOptions {
  return {
    type: 'postgres',
    host: appConfig.database.host,
    port: appConfig.database.port,
    username: appConfig.database.username,
    password: appConfig.database.password,
    database: appConfig.database.database,
    synchronize: false,
    // Timestamp-prefixed only — excludes CLI scripts (run/revert) that self-execute on import.
    migrations: [`${appConfig.rootDirname}/infrastructure/migrations/[0-9]*-*.{js,ts}`],
    entities: [`${appConfig.rootDirname}/application/**/*.entity.{js,ts}`],
    logging: appConfig.database.logging,
  };
}

export function createAppDataSource(appConfig: Config): DataSource {
  return new DataSource(prepareDataSource(appConfig));
}
