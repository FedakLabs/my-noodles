import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { DataSource, QueryRunner } from 'typeorm';

import { ServerlessDbUtils } from './serverless-db';

const QUERY_RETRY_INSTALLED = Symbol.for('my-noodles.serverlessDbQueryRetry');

type DriverWithConnections = {
  obtainMasterConnection?: () => Promise<unknown>;
  obtainSlaveConnection?: () => Promise<unknown>;
};

type QueryRunnerPrototype = {
  query: (...args: unknown[]) => Promise<unknown>;
  [QUERY_RETRY_INSTALLED]?: boolean;
};

/**
 * Installs runtime retries for serverless DB cold starts on the live TypeORM pool / query path.
 * Boot-time connect retries are handled separately via TypeOrmModule `toRetry`.
 */
@Injectable()
export class ServerlessDbInstaller implements OnApplicationBootstrap {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.installConnectionObtainRetry();
    await this.installQueryRunnerRetry();
  }

  private installConnectionObtainRetry(): void {
    const driver = this.dataSource.driver as DriverWithConnections;

    if (typeof driver.obtainMasterConnection === 'function') {
      const original = driver.obtainMasterConnection.bind(driver);
      driver.obtainMasterConnection = () => ServerlessDbUtils.retryOnTransientError(() => original());
    }

    if (typeof driver.obtainSlaveConnection === 'function') {
      const original = driver.obtainSlaveConnection.bind(driver);
      driver.obtainSlaveConnection = () => ServerlessDbUtils.retryOnTransientError(() => original());
    }
  }

  private async installQueryRunnerRetry(): Promise<void> {
    const runner = this.dataSource.createQueryRunner();
    const proto = Object.getPrototypeOf(runner) as QueryRunnerPrototype;

    try {
      if (proto[QUERY_RETRY_INSTALLED]) {
        return;
      }

      const originalQuery = proto.query;
      proto.query = async function serverlessDbRetryQuery(
        this: QueryRunner,
        ...args: unknown[]
      ): Promise<unknown> {
        // Mid-transaction retries can leave an unclear TX state — fail fast for the outer unit of work.
        if (this.isTransactionActive) {
          return await originalQuery.apply(this, args);
        }

        return await ServerlessDbUtils.retryOnTransientError(() => originalQuery.apply(this, args));
      };
      proto[QUERY_RETRY_INSTALLED] = true;
    } finally {
      await runner.release();
    }
  }
}
