import 'reflect-metadata';
import { createAppDataSource, DatabaseRetry, PostgresErrorClassifier } from '@my-noodles/api-lib/persistence';

import { config } from '@/config';

const dataSource = createAppDataSource(config);

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await new DatabaseRetry().run(() => dataSource.initialize(), {
      shouldRetry: PostgresErrorClassifier.isTransient,
    });
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
