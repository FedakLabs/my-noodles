import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import { createBaseConfig } from './base.mjs';
import { prettierEslintConfigs } from './prettier.mjs';

/** Web preset — React/Next/a11y on top of base; prettier ESLint layer last. */
export function createWebConfig(tsconfigRootDir) {
  return [
    ...createBaseConfig(tsconfigRootDir),
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      plugins: {
        react,
        'react-hooks': reactHooks,
        '@next/next': nextPlugin,
        'jsx-a11y': jsxA11y,
      },
      settings: {
        react: { version: 'detect' },
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        ...react.configs.flat['jsx-runtime'].rules,
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
        ...jsxA11y.flatConfigs.recommended.rules,
      },
    },
    ...prettierEslintConfigs,
  ];
}
