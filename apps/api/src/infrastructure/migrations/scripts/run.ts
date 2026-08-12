import 'reflect-metadata';
import { createAppDataSource } from '@my-noodles/api-lib/persistence';

import { config } from '@/config';
import { ServerlessDbUtils } from '@/infrastructure/persistence';

const dataSource = createAppDataSource(config);

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await ServerlessDbUtils.retryOnTransientError(() => dataSource.initialize());
  }

  try {
    await dataSource.runMigrations();
    console.log('Migrations applied.');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
