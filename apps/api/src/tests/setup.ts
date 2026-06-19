import 'reflect-metadata';

import { resolve } from 'node:path';

import { config as loadDotenv } from 'dotenv';

import { validEnv } from './fixtures/env';

const root = resolve(__dirname, '../..');

loadDotenv({ path: resolve(root, '.env') });
loadDotenv({ path: resolve(root, '.env.local'), override: true });

for (const [key, value] of Object.entries(validEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}

// Jest sets NODE_ENV=test (not in our enum). Force local so Winston logs to the
// console during test runs — makes failures much easier to trace.
process.env.NODE_ENV = validEnv.NODE_ENV;
