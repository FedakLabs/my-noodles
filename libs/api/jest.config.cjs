const { createJestConfig } = require('@my-noodles/jest-config/base');

/** @type {import('jest').Config} */
module.exports = createJestConfig({
  roots: ['<rootDir>/src'],
  testMatch: ['**/~*.test.ts'],
  setupFiles: ['reflect-metadata'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
});
