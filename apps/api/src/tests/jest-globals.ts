import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest as jestRuntime,
} from '@jest/globals';

/** @jest/globals runtime with @types/jest mock typings. */
export const jest = jestRuntime as typeof globalThis.jest;

export { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it };
