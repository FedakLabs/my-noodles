import { createNodeConfig } from '@my-noodles/eslint-config/node';

export default [
  { ignores: ['eslint.config.mjs', 'jest.config.cjs', 'scripts/dev.cjs', 'jest.config.mjs'] },
  ...createNodeConfig(import.meta.dirname),
];
