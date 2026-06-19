import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

import { config } from './config';

export const ormConfig = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  migrations: [`${__dirname}/infrastructure/migrations/*.{js,ts}`],
  entities: [`${__dirname}/application/**/*.entity.{js,ts}`],
  logging: config.nodeEnv === 'local',
} satisfies DataSourceOptions;

export const appDataSource = new DataSource(ormConfig);
