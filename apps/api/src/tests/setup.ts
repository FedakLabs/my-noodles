import 'reflect-metadata';

import { resolve } from 'node:path';

import { loadAppEnv } from '@my-noodles/api-lib/config';

import { validEnv } from './fixtures/env';

loadAppEnv(resolve(__dirname, '../..'));

for (const [key, value] of Object.entries(validEnv)) {
  if (process.env[key] === undefined) {
    process.env[key] = value;
  }
}

// Jest sets NODE_ENV=test (not in our enum). Force local so Winston logs to the
// console during test runs — makes failures much easier to trace.
process.env.NODE_ENV = validEnv.NODE_ENV;
