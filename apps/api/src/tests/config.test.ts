import { Config, validateEnvironment } from '../config';
import { validEnv, validOtelEnv } from './fixtures/env';

describe('validateEnvironment', () => {
  it('accepts a valid env payload and applies optional defaults', () => {
    const env = validateEnvironment(validEnv);

    expect(env.PORT).toBe(3001);
    expect(env.NODE_ENV).toBe('local');
    expect(env.POSTGRES_HOST).toBe('localhost');
    expect(env.OTEL_ENABLED).toBe(false);
    expect(env.SHUTDOWN_TIMEOUT_MS).toBe(30_000);
  });

  it('rejects missing postgres credentials', () => {
    const { POSTGRES_PASSWORD: _password, ...envWithoutPassword } = validEnv;

    expect(() => validateEnvironment(envWithoutPassword)).toThrow(/Invalid environment configuration/);
  });

  it('coerces common truthy OTEL_ENABLED values when otel settings are provided', () => {
    expect(validateEnvironment({ ...validOtelEnv, OTEL_ENABLED: 'true' }).OTEL_ENABLED).toBe(true);
    expect(validateEnvironment({ ...validOtelEnv, OTEL_ENABLED: '1' }).OTEL_ENABLED).toBe(true);
  });

  it('requires otel settings when OTEL_ENABLED is true', () => {
    expect(() => validateEnvironment({ ...validEnv, OTEL_ENABLED: 'true' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('allows missing otel settings when OTEL_ENABLED is false', () => {
    const env = validateEnvironment(validEnv);

    expect(env.OTEL_ENABLED).toBe(false);
    expect(env.OTEL_EXPORTER_OTLP_ENDPOINT).toBeUndefined();
    expect(env.OTEL_SERVICE_NAME).toBeUndefined();
  });

  it('rejects invalid ports', () => {
    expect(() => validateEnvironment({ ...validEnv, PORT: '0' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('rejects empty postgres host', () => {
    expect(() => validateEnvironment({ ...validEnv, POSTGRES_HOST: '' })).toThrow(
      /Invalid environment configuration/,
    );
  });

  it('rejects shutdown timeouts outside the allowed range', () => {
    expect(() => validateEnvironment({ ...validEnv, SHUTDOWN_TIMEOUT_MS: '500' })).toThrow(
      /Invalid environment configuration/,
    );
  });
});

describe('Config.fromEnvironment', () => {
  it('maps environment variables into the app config shape', () => {
    const appConfig = Config.fromEnvironment(validateEnvironment(validEnv));

    expect(appConfig.port).toBe(3001);
    expect(appConfig.database).toEqual({
      host: 'localhost',
      port: 5432,
      username: 'my_noodles',
      password: 'my_noodles',
      database: 'my_noodles',
    });
    expect(appConfig.otel.enabled).toBe(false);
  });
});
