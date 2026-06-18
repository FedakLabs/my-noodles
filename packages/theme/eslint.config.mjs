import { createBaseConfig } from '@my-noodles/eslint-config/base';
import { prettierEslintConfigs } from '@my-noodles/eslint-config/prettier';

export default [
  { ignores: ['eslint.config.mjs', 'vitest.config.ts'] },
  ...createBaseConfig(import.meta.dirname),
  ...prettierEslintConfigs,
];
