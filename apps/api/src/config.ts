import { Config } from '@my-noodles/api-lib/config';

export const config = new Config(__dirname, (env) => {
  const databaseUrl = env.DATABASE_URL;

  return {
    appName: env.APP_NAME ?? 'my-noodles-api',
    appVersion: env.APP_VERSION ?? 'dev',
    port: env.PORT,
    nodeEnv: env.NODE_ENV ?? 'local',
    database: {
      driver: 'postgres',
      url: databaseUrl,
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
      name: env.DATABASE_NAME,
      ssl: env.DATABASE_SSL ?? (databaseUrl ? 'true' : 'false'),
      logging: env.DATABASE_LOGGING ?? 'false',
    },
    otelEnabled: env.OTEL_ENABLED ?? 'false',
    otelEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    otelServiceName: env.OTEL_SERVICE_NAME,
    sentryEnabled: env.SENTRY_ENABLED ?? 'false',
    sentryDsn: env.SENTRY_DSN,
    shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS ?? '30000',
    responseDelayMs: env.API_RESPONSE_DELAY_MS ?? '0',
  };
});
