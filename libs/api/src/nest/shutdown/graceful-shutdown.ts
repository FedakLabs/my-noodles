import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { logger } from '../../logger';

export type GracefulShutdownOptions = Readonly<{
  timeoutMs: number;
  enabled?: boolean;
}>;

export class GracefulShutdown {
  private isShuttingDown = false;

  constructor(
    private readonly app: INestApplication,
    private readonly options: GracefulShutdownOptions,
  ) {}

  register(): void {
    if (this.options.enabled === false) {
      return;
    }

    const handleSignal = (signal: NodeJS.Signals) => {
      void this.shutdown(signal);
    };

    process.once('SIGTERM', handleSignal);
    process.once('SIGINT', handleSignal);
  }

  async shutdown(signal: NodeJS.Signals): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    logger.info({ msg: 'shutdown.start', signal });

    const dataSource = this.app.get<DataSource>(DataSource, { strict: false });

    const forceExitTimer = setTimeout(() => {
      logger.error({
        msg: 'shutdown.timeout',
        signal,
        timeoutMs: this.options.timeoutMs,
      });
      process.exit(1);
    }, this.options.timeoutMs);

    try {
      await this.app.close();
      await this.closeResources(dataSource, signal);
      clearTimeout(forceExitTimer);
      logger.info({ msg: 'shutdown.complete', signal });
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExitTimer);
      logger.error({ msg: 'shutdown.error', signal, error });
      process.exit(1);
    }
  }

  private async closeResources(dataSource: DataSource | undefined, signal: NodeJS.Signals): Promise<void> {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }

    logger.info({ msg: 'shutdown.resources.complete', signal });
  }
}
