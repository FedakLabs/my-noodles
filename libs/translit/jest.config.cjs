const { createJestConfig } = require('@my-noodles/jest-config/base');

/** @type {import('jest').Config} */
module.exports = createJestConfig({
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
});
