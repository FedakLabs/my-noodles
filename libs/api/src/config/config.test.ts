import { validEnv, validOtelEnv, validSentryEnv } from '../tests/fixtures/env';
import { Config } from './config';

const ROOT_DIRNAME = '/tmp/my-noodles-api/src';

const MANAGED_ENV_KEYS = [
  ...Object.keys(validEnv),
  'DATABASE_URL',
  'DATABASE_SSL',
  'DATABASE_LOGGING',
  'API_RESPONSE_DELAY_MS',
  'OTEL_EXPORTER_OTLP_ENDPOINT',
  'OTEL_SERVICE_NAME',
  'SENTRY_DSN',
] as const;

function applyEnv(overrides: Record<string, string | undefined> = {}): void {
  const merged = { ...validEnv, ...overrides };

  for (const key of MANAGED_ENV_KEYS) {
    const value = merged[key as keyof typeof merged];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe('Config', () => {
  const envSnapshot = { ...process.env };

  beforeEach(() => {
    applyEnv();
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in envSnapshot)) {
        delete process.env[key];
      }
    }
    for (const [key, value] of Object.entries(envSnapshot)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('loads a valid config and applies defaults', () => {
    const appConfig = new Config({ rootDirname: ROOT_DIRNAME });

    expect(appConfig.port).toBe(3001);
    expect(appConfig.nodeEnv).toBe('local');
    expect(appConfig.rootDirname).toBe(ROOT_DIRNAME);
    expect(appConfig.database).toMatchObject({
      host: 'localhost',
      port: 5432,
      username: 'my_noodles',
      password: 'my_noodles',
      database: 'my_noodles',
      ssl: false,
      logging: false,
    });
    expect(appConfig.database.url).toBeFalsy();
    expect(appConfig.otel.enabled).toBe(false);
    expect(appConfig.sentry.enabled).toBe(false);
    expect(appConfig.shutdownTimeoutMs).toBe(30_000);
    expect(appConfig.appName).toBe('my-noodles-api');
    expect(appConfig.appVersion).toBe('dev');
    expect(appConfig.responseDelayMs).toBe(0);
  });

  it('rejects missing postgres credentials', () => {
    applyEnv({ POSTGRES_PASSWORD: undefined });

    expect(() => new Config({ rootDirname: ROOT_DIRNAME })).toThrow(/Invalid Application configuration/);
  });

  it('accepts DATABASE_URL instead of discrete POSTGRES_* fields', () => {
    applyEnv({
      POSTGRES_HOST: undefined,
      POSTGRES_PORT: undefined,
      POSTGRES_USER: undefined,
      POSTGRES_PASSWORD: undefined,
      POSTGRES_DB: undefined,
      DATABASE_URL:
        'postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=10',
    });

    const appConfig = new Config({ rootDirname: ROOT_DIRNAME });

    expect(appConfig.database.url).toContain('neon.tech');
    expect(appConfig.database.ssl).toBe(true);
  });

  it('coerces common truthy OTEL_ENABLED values when otel settings are provided', () => {
    applyEnv({ ...validOtelEnv, OTEL_ENABLED: 'true' });
    expect(new Config({ rootDirname: ROOT_DIRNAME }).otel.enabled).toBe(true);

    applyEnv({ ...validOtelEnv, OTEL_ENABLED: '1' });
    expect(new Config({ rootDirname: ROOT_DIRNAME }).otel.enabled).toBe(true);
  });

  it('requires otel settings when OTEL_ENABLED is true', () => {
    applyEnv({ OTEL_ENABLED: 'true' });

    expect(() => new Config({ rootDirname: ROOT_DIRNAME })).toThrow(/Invalid Application configuration/);
  });

  it('allows missing otel settings when OTEL_ENABLED is false', () => {
    const appConfig = new Config({ rootDirname: ROOT_DIRNAME });

    expect(appConfig.otel.enabled).toBe(false);
  });

  it('coerces common truthy SENTRY_ENABLED values when sentry settings are provided', () => {
    applyEnv({ ...validSentryEnv, SENTRY_ENABLED: 'true' });
    expect(new Config({ rootDirname: ROOT_DIRNAME }).sentry.enabled).toBe(true);

    applyEnv({ ...validSentryEnv, SENTRY_ENABLED: '1' });
    expect(new Config({ rootDirname: ROOT_DIRNAME }).sentry.enabled).toBe(true);
  });

  it('requires sentry DSN when SENTRY_ENABLED is true', () => {
    applyEnv({ SENTRY_ENABLED: 'true' });

    expect(() => new Config({ rootDirname: ROOT_DIRNAME })).toThrow(/Invalid Application configuration/);
  });

  it('allows missing sentry settings when SENTRY_ENABLED is false', () => {
    const appConfig = new Config({ rootDirname: ROOT_DIRNAME });

    expect(appConfig.sentry.enabled).toBe(false);
  });

  it('coerces DATABASE_LOGGING when set', () => {
    applyEnv({ DATABASE_LOGGING: 'true' });
    expect(new Config({ rootDirname: ROOT_DIRNAME }).database.logging).toBe(true);

    applyEnv({ DATABASE_LOGGING: '1' });
    expect(new Config({ rootDirname: ROOT_DIRNAME }).database.logging).toBe(true);

    applyEnv();
    expect(new Config({ rootDirname: ROOT_DIRNAME }).database.logging).toBe(false);
  });

  it('rejects invalid ports', () => {
    applyEnv({ PORT: '0' });

    expect(() => new Config({ rootDirname: ROOT_DIRNAME })).toThrow(/Invalid Application configuration/);
  });

  it('rejects empty postgres host', () => {
    applyEnv({ POSTGRES_HOST: '' });

    expect(() => new Config({ rootDirname: ROOT_DIRNAME })).toThrow(/Invalid Application configuration/);
  });

  it('rejects shutdown timeouts outside the allowed range', () => {
    applyEnv({ SHUTDOWN_TIMEOUT_MS: '500' });

    expect(() => new Config({ rootDirname: ROOT_DIRNAME })).toThrow(/Invalid Application configuration/);
  });

  it('loads API_RESPONSE_DELAY_MS when set', () => {
    applyEnv({ API_RESPONSE_DELAY_MS: '1500' });

    expect(new Config({ rootDirname: ROOT_DIRNAME }).responseDelayMs).toBe(1500);
  });
});
