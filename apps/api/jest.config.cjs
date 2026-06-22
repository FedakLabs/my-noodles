const { createJestConfig } = require('@my-noodles/jest-config/base');

/** @type {import('jest').Config} */
module.exports = createJestConfig({
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/src/tests'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: ['**/*.test.ts'],
});
