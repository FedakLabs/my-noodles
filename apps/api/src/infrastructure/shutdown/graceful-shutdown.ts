import type { INestApplication, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';

import { config } from '@/config';

let isShuttingDown = false;

async function closeDatabase(dataSource: DataSource | undefined): Promise<void> {
  if (!dataSource?.isInitialized) {
    return;
  }

  await dataSource.destroy();
}

async function shutdownResources(
  app: INestApplication,
  dataSource: DataSource | undefined,
  signal: NodeJS.Signals,
): Promise<void> {
  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);

  await closeDatabase(dataSource);

  logger.log?.({ msg: 'shutdown.resources.complete', signal });
}

export async function gracefulShutdown(app: INestApplication, signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  logger.log?.({ msg: 'shutdown.start', signal });

  const dataSource = app.get<DataSource>(DataSource, { strict: false });

  const forceExitTimer = setTimeout(() => {
    logger.error?.({
      msg: 'shutdown.timeout',
      signal,
      timeoutMs: config.shutdownTimeoutMs,
    });
    process.exit(1);
  }, config.shutdownTimeoutMs);

  try {
    await app.close();
    await shutdownResources(app, dataSource, signal);
    clearTimeout(forceExitTimer);
    logger.log?.({ msg: 'shutdown.complete', signal });
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    logger.error?.({ msg: 'shutdown.error', signal, error });
    process.exit(1);
  }
}

export function registerGracefulShutdown(app: INestApplication): void {
  if (config.nodeEnv === 'local') {
    return;
  }

  const handleSignal = (signal: NodeJS.Signals) => {
    void gracefulShutdown(app, signal);
  };

  process.once('SIGTERM', handleSignal);
  process.once('SIGINT', handleSignal);
}

export function resetGracefulShutdownState(): void {
  isShuttingDown = false;
}
