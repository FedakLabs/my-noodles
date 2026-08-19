import { type ConfigOptions } from '../../config';

export const validConfigOptions = {
  appName: 'my-noodles-api',
  appVersion: 'dev',
  port: '3001',
  nodeEnv: 'local',
  database: {
    driver: 'postgres',
    url: undefined,
    host: 'localhost',
    port: '5432',
    username: 'my_noodles',
    password: 'my_noodles',
    name: 'my_noodles',
    ssl: 'false',
    logging: 'false',
  },
  otelEnabled: 'false',
  otelEndpoint: undefined,
  otelServiceName: undefined,
  sentryEnabled: 'false',
  sentryDsn: undefined,
  shutdownTimeoutMs: '30000',
  responseDelayMs: '0',
} as const satisfies ConfigOptions;

export const validOtelConfigOptions = {
  ...validConfigOptions,
  otelEnabled: 'true',
  otelEndpoint: 'http://localhost:4318',
  otelServiceName: 'my-noodles-api',
} as const satisfies ConfigOptions;

export const validSentryConfigOptions = {
  ...validConfigOptions,
  sentryEnabled: 'true',
  sentryDsn: 'https://public@o0.ingest.sentry.io/0',
} as const satisfies ConfigOptions;
