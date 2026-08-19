import { validConfigOptions, validOtelConfigOptions, validSentryConfigOptions } from '../tests/fixtures/env';
import { Config, type ConfigOptions, type DatabaseConfigOptions } from './config';

const ROOT_DIRNAME = '/tmp/my-noodles-api/src';

type ConfigOverrides = Omit<Partial<ConfigOptions>, 'database'> & {
  database?: Partial<DatabaseConfigOptions>;
};

function createOptions(overrides: ConfigOverrides = {}): ConfigOptions {
  const { database, ...config } = overrides;

  return {
    ...validConfigOptions,
    ...config,
    database: {
      ...validConfigOptions.database,
      ...database,
    },
  };
}

function createConfig(overrides: ConfigOverrides = {}): Config {
  return new Config(ROOT_DIRNAME, () => createOptions(overrides));
}

function createConfigFrom(options: ConfigOptions): Config {
  return new Config(ROOT_DIRNAME, () => options);
}

describe('Config', () => {
  it('loads env before invoking the factory and validates its options', () => {
    let receivedEnv: NodeJS.ProcessEnv | undefined;

    const appConfig = new Config(ROOT_DIRNAME, (env) => {
      receivedEnv = env;
      return createOptions();
    });

    expect(receivedEnv).toBe(process.env);
    expect(appConfig.port).toBe(3001);
    expect(appConfig.nodeEnv).toBe('local');
    expect(appConfig.rootDirname).toBe(ROOT_DIRNAME);
    expect(appConfig.database).toMatchObject({
      driver: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'my_noodles',
      password: 'my_noodles',
      name: 'my_noodles',
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

  it('rejects a missing database credential', () => {
    expect(() => createConfig({ database: { password: undefined } })).toThrow(
      /Invalid Application configuration/,
    );
  });

  it('accepts a supported database driver', () => {
    expect(createConfig({ database: { driver: 'postgres' } }).database.driver).toBe('postgres');
  });

  it('rejects an unsupported database driver', () => {
    expect(() => createConfig({ database: { driver: 'mysql' } })).toThrow(
      /Invalid Application configuration/,
    );
  });

  it('accepts a database URL instead of discrete connection fields', () => {
    const appConfig = createConfig({
      database: {
        host: undefined,
        port: undefined,
        username: undefined,
        password: undefined,
        name: undefined,
        url: 'postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require',
        ssl: 'true',
      },
    });

    expect(appConfig.database.url).toContain('neon.tech');
    expect(appConfig.database.ssl).toBe(true);
  });

  it('coerces common truthy OpenTelemetry values', () => {
    expect(createConfigFrom({ ...validOtelConfigOptions, otelEnabled: 'true' }).otel.enabled).toBe(true);
    expect(createConfigFrom({ ...validOtelConfigOptions, otelEnabled: '1' }).otel.enabled).toBe(true);
  });

  it('requires OpenTelemetry settings when enabled', () => {
    expect(() =>
      createConfig({ otelEnabled: 'true', otelEndpoint: undefined, otelServiceName: undefined }),
    ).toThrow(/Invalid Application configuration/);
  });

  it('allows missing OpenTelemetry settings when disabled', () => {
    expect(createConfig().otel.enabled).toBe(false);
  });

  it('coerces common truthy Sentry values', () => {
    expect(createConfigFrom({ ...validSentryConfigOptions, sentryEnabled: 'true' }).sentry.enabled).toBe(
      true,
    );
    expect(createConfigFrom({ ...validSentryConfigOptions, sentryEnabled: '1' }).sentry.enabled).toBe(true);
  });

  it('requires a Sentry DSN when enabled', () => {
    expect(() => createConfig({ sentryEnabled: 'true', sentryDsn: undefined })).toThrow(
      /Invalid Application configuration/,
    );
  });

  it('allows a missing Sentry DSN when disabled', () => {
    expect(createConfig().sentry.enabled).toBe(false);
  });

  it('coerces database logging', () => {
    expect(createConfig({ database: { logging: 'true' } }).database.logging).toBe(true);
    expect(createConfig({ database: { logging: '1' } }).database.logging).toBe(true);
    expect(createConfig().database.logging).toBe(false);
  });

  it('rejects invalid ports', () => {
    expect(() => createConfig({ port: '0' })).toThrow(/Invalid Application configuration/);
  });

  it('rejects an empty database host', () => {
    expect(() => createConfig({ database: { host: '' } })).toThrow(/Invalid Application configuration/);
  });

  it('rejects shutdown timeouts outside the allowed range', () => {
    expect(() => createConfig({ shutdownTimeoutMs: '500' })).toThrow(/Invalid Application configuration/);
  });

  it('loads a response delay when provided', () => {
    expect(createConfig({ responseDelayMs: '1500' }).responseDelayMs).toBe(1500);
  });
});
