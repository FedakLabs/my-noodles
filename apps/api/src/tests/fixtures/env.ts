export const validEnv = {
  PORT: '3001',
  NODE_ENV: 'local',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '5432',
  DATABASE_USERNAME: 'my_noodles',
  DATABASE_PASSWORD: 'my_noodles',
  DATABASE_NAME: 'my_noodles',
  OTEL_ENABLED: 'false',
  SHUTDOWN_TIMEOUT_MS: '30000',
  APP_NAME: 'my-noodles-api',
  APP_VERSION: 'dev',
  JWT_SECRET: 'test-jwt-secret-key-at-least-16-characters',
  TELEGRAM_BOT_TOKEN: 'test-bot-token',
  TELEGRAM_CHAT_ID: '123456789',
  TAWK_API_KEY: 'test-tawk-api-key',
  TAWK_PROPERTY_ID: 'test-tawk-property-id',
  TAWK_WIDGET_ID: 'test-tawk-widget-id',
  NOVA_POSHTA_API_KEY: 'test-nova-poshta-key',
} as const;

export const validOtelEnv = {
  ...validEnv,
  OTEL_ENABLED: 'true',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
  OTEL_SERVICE_NAME: 'my-noodles-api',
} as const;
