import { resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';

export const NODE_ENVS = ['local', 'dev', 'prod'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

export const DEFAULT_NODE_ENV: NodeEnv = 'local';

/**
 * Load env files in order (later overrides earlier):
 * 1. `.env` — shared defaults
 * 2. `.env.{NODE_ENV}` — e.g. `.env.local`, `.env.dev`, `.env.prod`
 * 3. `.env.local` — machine-specific secrets (gitignored)
 *
 * When `NODE_ENV=local`, steps 2 and 3 resolve to the same file (loaded once).
 */
export function loadAppEnv(cwd = process.cwd()): void {
  loadDotenv({ path: resolve(cwd, '.env') });

  const nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV;

  for (const filename of [...new Set([`.env.${nodeEnv}`, '.env.local'])]) {
    loadDotenv({ path: resolve(cwd, filename), override: true });
  }
}

/** Shallow env shape consumed by `loadConfig()` — values are strings from `process.env` (or test fixtures). */
export type ConfigEnvironment = {
  PORT?: string;
  NODE_ENV?: string;
  POSTGRES_HOST?: string;
  POSTGRES_PORT?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
  DATABASE_LOGGING?: string;
  OTEL_ENABLED?: string;
  OTEL_EXPORTER_OTLP_ENDPOINT?: string;
  OTEL_SERVICE_NAME?: string;
  SHUTDOWN_TIMEOUT_MS?: string;
  APP_NAME?: string;
  APP_VERSION?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

export function readConfigEnvironment(env: NodeJS.ProcessEnv): ConfigEnvironment {
  return {
    PORT: env.PORT,
    NODE_ENV: env.NODE_ENV,
    POSTGRES_HOST: env.POSTGRES_HOST,
    POSTGRES_PORT: env.POSTGRES_PORT,
    POSTGRES_USER: env.POSTGRES_USER,
    POSTGRES_PASSWORD: env.POSTGRES_PASSWORD,
    POSTGRES_DB: env.POSTGRES_DB,
    DATABASE_LOGGING: env.DATABASE_LOGGING,
    OTEL_ENABLED: env.OTEL_ENABLED,
    OTEL_EXPORTER_OTLP_ENDPOINT: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    OTEL_SERVICE_NAME: env.OTEL_SERVICE_NAME,
    SHUTDOWN_TIMEOUT_MS: env.SHUTDOWN_TIMEOUT_MS,
    APP_NAME: env.APP_NAME,
    APP_VERSION: env.APP_VERSION,
    TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: env.TELEGRAM_CHAT_ID,
  };
}
