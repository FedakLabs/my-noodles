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
  TELEGRAM_BOT_TOKEN: 'test-bot-token',
  TELEGRAM_CHAT_ID: '123456789',
  TAWK_API_KEY: 'test-tawk-api-key',
  NOVA_POSHTA_API_KEY: 'test-nova-poshta-key',
} as const;

export const validOtelEnv = {
  ...validEnv,
  OTEL_ENABLED: 'true',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
  OTEL_SERVICE_NAME: 'my-noodles-api',
} as const;
