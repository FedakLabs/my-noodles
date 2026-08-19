import { AuthConfig } from '../../application/auth/auth.config';
import { config } from '../../config';
import { validEnv } from '../fixtures/env';

const REQUIRED_AUTH_ENV = ['JWT_SECRET'] as const;

describe('AuthConfig', () => {
  afterEach(() => {
    for (const key of REQUIRED_AUTH_ENV) {
      process.env[key] = validEnv[key];
    }
  });

  it.each(REQUIRED_AUTH_ENV)('fails startup validation when %s is missing', (key) => {
    process.env[key] = '';

    expect(() => config.validate(new AuthConfig(), 'Auth configuration')).toThrow(
      'Invalid Auth configuration',
    );
  });
});
