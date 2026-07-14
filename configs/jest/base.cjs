/** @type {import('jest').Config} */
const baseJestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  passWithNoTests: true,
  // Avoid broken host watchman (e.g. root-owned XDG state dir).
  watchman: false,
};

function createJestConfig(overrides = {}) {
  return {
    ...baseJestConfig,
    ...overrides,
  };
}

module.exports = { baseJestConfig, createJestConfig };
