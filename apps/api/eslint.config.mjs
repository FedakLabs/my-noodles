import { createNodeConfig } from '@my-noodles/eslint-config/node';

export default [
  { ignores: ['eslint.config.mjs', 'jest.config.cjs'] },
  ...createNodeConfig(import.meta.dirname),
];
