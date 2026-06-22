/** @type {import('jest').Config} */
const baseJestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  passWithNoTests: true,
};

function createJestConfig(overrides = {}) {
  return {
    ...baseJestConfig,
    ...overrides,
  };
}

module.exports = { baseJestConfig, createJestConfig };
