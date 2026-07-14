import 'reflect-metadata';
import { config } from '@/config';
import { createAppDataSource } from '@/infrastructure/persistence';

const dataSource = createAppDataSource(config);

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
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
