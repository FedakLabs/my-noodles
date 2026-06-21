import storybook from 'eslint-plugin-storybook';

import { createBaseConfig } from '@my-noodles/eslint-config/base';
import { prettierEslintConfigs } from '@my-noodles/eslint-config/prettier';

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'vitest.config.ts',
      'dist/**',
      'scripts/**',
      '.storybook/**',
      'src/stories/**',
      '**/*.d.ts',
    ],
  },
  ...createBaseConfig(import.meta.dirname),
  ...prettierEslintConfigs,
  ...storybook.configs['flat/recommended'],
];
