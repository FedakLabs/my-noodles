import type { DataSource, QueryRunner } from 'typeorm';

import { DatabaseRetry } from './database-retry';
import { PostgresErrorClassifier } from './postgres-error-classifier';

const CONNECTION_RETRY_INSTALLED = Symbol('postgresConnectionRetryInstalled');
const QUERY_RETRY_INSTALLED = Symbol('postgresQueryRetryInstalled');

type DriverWithConnections = {
  [CONNECTION_RETRY_INSTALLED]?: boolean;
  obtainMasterConnection?: () => Promise<unknown>;
  obtainSlaveConnection?: () => Promise<unknown>;
};

type QueryRunnerPrototype = {
  [QUERY_RETRY_INSTALLED]?: boolean;
  query: (...args: unknown[]) => Promise<unknown>;
};

const READ_ONLY_STATEMENTS = new Set(['SELECT', 'TABLE', 'VALUES', 'SHOW']);

/** Installs conservative connection and read-query recovery for PostgreSQL TypeORM. */
export class PostgresTypeOrmResilience {
  constructor(private readonly retry = new DatabaseRetry()) {}

  async install(dataSource: DataSource): Promise<void> {
    this.installConnectionRetry(dataSource);
    await this.installQueryRetry(dataSource);
  }

  private installConnectionRetry(dataSource: DataSource): void {
    const driver = dataSource.driver as DriverWithConnections;

    if (driver[CONNECTION_RETRY_INSTALLED]) {
      return;
    }

    for (const method of ['obtainMasterConnection', 'obtainSlaveConnection'] as const) {
      const original = driver[method];
      if (typeof original === 'function') {
        const bound = original.bind(driver);
        driver[method] = () =>
          this.retry.run(() => bound(), {
            shouldRetry: (error) => PostgresErrorClassifier.isTransient(error),
          });
      }
    }

    driver[CONNECTION_RETRY_INSTALLED] = true;
  }

  private async installQueryRetry(dataSource: DataSource): Promise<void> {
    const runner = dataSource.createQueryRunner();
    const prototype = Object.getPrototypeOf(runner) as QueryRunnerPrototype;

    try {
      if (prototype[QUERY_RETRY_INSTALLED]) {
        return;
      }

      const originalQuery = prototype.query;
      const retry = this.retry;
      prototype.query = async function postgresResilientQuery(
        this: QueryRunner,
        ...args: unknown[]
      ): Promise<unknown> {
        const sql = typeof args[0] === 'string' ? args[0] : undefined;
        const executeQuery = originalQuery.bind(this, ...args);

        if (this.isTransactionActive || !isPostgresReadOnlySql(sql)) {
          return await executeQuery();
        }

        return await retry.run(executeQuery, {
          shouldRetry: (error) => PostgresErrorClassifier.isTransient(error),
        });
      };
      prototype[QUERY_RETRY_INSTALLED] = true;
    } finally {
      await runner.release();
    }
  }
}

export function isPostgresReadOnlySql(sql: string | undefined): boolean {
  if (!sql) {
    return false;
  }

  const statement = removeLeadingComments(sql)
    .match(/^[A-Za-z]+/)?.[0]
    .toUpperCase();
  return statement !== undefined && READ_ONLY_STATEMENTS.has(statement);
}

function removeLeadingComments(sql: string): string {
  let value = sql.trimStart();

  while (value.startsWith('--') || value.startsWith('/*')) {
    if (value.startsWith('--')) {
      const lineEnd = value.indexOf('\n');
      value = lineEnd === -1 ? '' : value.slice(lineEnd + 1).trimStart();
      continue;
    }

    const commentEnd = value.indexOf('*/', 2);
    value = commentEnd === -1 ? '' : value.slice(commentEnd + 2).trimStart();
  }

  return value;
}
