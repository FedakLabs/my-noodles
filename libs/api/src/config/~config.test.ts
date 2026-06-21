import { loadConfig } from './config';
import { validEnv, validOtelEnv } from './fixtures/env';

const ROOT_DIRNAME = '/tmp/my-noodles-api/src';

describe('loadConfig', () => {
  it('loads a valid config and applies defaults', () => {
    const appConfig = loadConfig(validEnv, { rootDirname: ROOT_DIRNAME });

    expect(appConfig.port).toBe(3001);
    expect(appConfig.nodeEnv).toBe('local');
    expect(appConfig.rootDirname).toBe(ROOT_DIRNAME);
    expect(appConfig.database).toEqual({
      host: 'localhost',
      port: 5432,
      username: 'my_noodles',
      password: 'my_noodles',
      database: 'my_noodles',
      logging: false,
    });
    expect(appConfig.otel.enabled).toBe(false);
    expect(appConfig.shutdownTimeoutMs).toBe(30_000);
    expect(appConfig.appName).toBe('my-noodles-api');
    expect(appConfig.appVersion).toBe('dev');
    expect(appConfig.responseDelayMs).toBe(0);
  });

  it('rejects missing postgres credentials', () => {
    const { POSTGRES_PASSWORD: _password, ...envWithoutPassword } = validEnv;

    expect(() => loadConfig(envWithoutPassword, { rootDirname: ROOT_DIRNAME })).toThrow(
      /Invalid application configuration/,
    );
  });

  it('coerces common truthy OTEL_ENABLED values when otel settings are provided', () => {
    expect(
      loadConfig({ ...validOtelEnv, OTEL_ENABLED: 'true' }, { rootDirname: ROOT_DIRNAME }).otel.enabled,
    ).toBe(true);
    expect(
      loadConfig({ ...validOtelEnv, OTEL_ENABLED: '1' }, { rootDirname: ROOT_DIRNAME }).otel.enabled,
    ).toBe(true);
  });

  it('requires otel settings when OTEL_ENABLED is true', () => {
    expect(() => loadConfig({ ...validEnv, OTEL_ENABLED: 'true' }, { rootDirname: ROOT_DIRNAME })).toThrow(
      /Invalid application configuration/,
    );
  });

  it('allows missing otel settings when OTEL_ENABLED is false', () => {
    const appConfig = loadConfig(validEnv, { rootDirname: ROOT_DIRNAME });

    expect(appConfig.otel.enabled).toBe(false);
  });

  it('coerces DATABASE_LOGGING when set', () => {
    expect(
      loadConfig({ ...validEnv, DATABASE_LOGGING: 'true' }, { rootDirname: ROOT_DIRNAME }).database.logging,
    ).toBe(true);
    expect(
      loadConfig({ ...validEnv, DATABASE_LOGGING: '1' }, { rootDirname: ROOT_DIRNAME }).database.logging,
    ).toBe(true);
    expect(loadConfig(validEnv, { rootDirname: ROOT_DIRNAME }).database.logging).toBe(false);
  });

  it('rejects invalid ports', () => {
    expect(() => loadConfig({ ...validEnv, PORT: '0' }, { rootDirname: ROOT_DIRNAME })).toThrow(
      /Invalid application configuration/,
    );
  });

  it('rejects empty postgres host', () => {
    expect(() => loadConfig({ ...validEnv, POSTGRES_HOST: '' }, { rootDirname: ROOT_DIRNAME })).toThrow(
      /Invalid application configuration/,
    );
  });

  it('rejects shutdown timeouts outside the allowed range', () => {
    expect(() =>
      loadConfig({ ...validEnv, SHUTDOWN_TIMEOUT_MS: '500' }, { rootDirname: ROOT_DIRNAME }),
    ).toThrow(/Invalid application configuration/);
  });

  it('loads API_RESPONSE_DELAY_MS when set', () => {
    expect(
      loadConfig({ ...validEnv, API_RESPONSE_DELAY_MS: '1500' }, { rootDirname: ROOT_DIRNAME })
        .responseDelayMs,
    ).toBe(1500);
  });
});
