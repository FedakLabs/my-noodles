import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

import type { Config } from '../config';

export type DataSourceGlobOptions = Readonly<{
  migrations?: string[];
  entities?: string[];
}>;

function defaultGlobs(rootDirname: string): Required<DataSourceGlobOptions> {
  return {
    migrations: [`${rootDirname}/infrastructure/migrations/[0-9]*-*.{js,ts}`],
    entities: [`${rootDirname}/application/**/*.entity.{js,ts}`],
  };
}

export function prepareDataSource(appConfig: Config, globs?: DataSourceGlobOptions): DataSourceOptions {
  const defaults = defaultGlobs(appConfig.rootDirname);

  return {
    type: 'postgres',
    host: appConfig.database.host,
    port: appConfig.database.port,
    username: appConfig.database.username,
    password: appConfig.database.password,
    database: appConfig.database.database,
    synchronize: false,
    // Timestamp-prefixed only — excludes CLI scripts (run/revert) that self-execute on import.
    migrations: globs?.migrations ?? defaults.migrations,
    entities: globs?.entities ?? defaults.entities,
    logging: appConfig.database.logging,
  };
}

export function createAppDataSource(appConfig: Config, globs?: DataSourceGlobOptions): DataSource {
  return new DataSource(prepareDataSource(appConfig, globs));
}
