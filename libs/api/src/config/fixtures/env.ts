import type { ConfigEnvironment } from '../env';

export const validEnv = {
  PORT: '3001',
  NODE_ENV: 'local',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  POSTGRES_USER: 'my_noodles',
  POSTGRES_PASSWORD: 'my_noodles',
  POSTGRES_DB: 'my_noodles',
  OTEL_ENABLED: 'false',
  SHUTDOWN_TIMEOUT_MS: '30000',
  APP_NAME: 'my-noodles-api',
  APP_VERSION: 'dev',
} as const satisfies ConfigEnvironment;

export const validOtelEnv = {
  ...validEnv,
  OTEL_ENABLED: 'true',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
  OTEL_SERVICE_NAME: 'my-noodles-api',
} as const;
