export const validEnv = {
  PORT: '3001',
  NODE_ENV: 'local',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  POSTGRES_USER: 'my_noodles',
  POSTGRES_PASSWORD: 'my_noodles',
  POSTGRES_DB: 'my_noodles',
  OTEL_ENABLED: 'false',
  SENTRY_ENABLED: 'false',
  SHUTDOWN_TIMEOUT_MS: '30000',
  APP_NAME: 'my-noodles-api',
  APP_VERSION: 'dev',
} as const;

export const validOtelEnv = {
  ...validEnv,
  OTEL_ENABLED: 'true',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
  OTEL_SERVICE_NAME: 'my-noodles-api',
} as const;

export const validSentryEnv = {
  ...validEnv,
  SENTRY_ENABLED: 'true',
  SENTRY_DSN: 'https://public@o0.ingest.sentry.io/0',
} as const;
