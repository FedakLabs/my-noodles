import 'reflect-metadata';
import { validEnv } from './fixtures/env';

// Always overwrite — local `.env` secrets (or a polluted parent process) must not
// leak into unit tests that assert against fixture values.
for (const [key, value] of Object.entries(validEnv)) {
  process.env[key] = value;
}

// Jest sets NODE_ENV=test (not in our enum). Force local so Winston logs to the
// console during test runs — makes failures much easier to trace.
process.env.NODE_ENV = validEnv.NODE_ENV;
