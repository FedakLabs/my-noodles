import globals from 'globals';

import { createBaseConfig } from './base.mjs';
import { prettierEslintConfigs } from './prettier.mjs';

/** Node/Nest preset — base rules with Node globals; prettier ESLint layer last. */
export function createNodeConfig(tsconfigRootDir) {
  return [
    ...createBaseConfig(tsconfigRootDir),
    {
      files: ['**/*.{ts,js,mjs,cjs}'],
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },
    ...prettierEslintConfigs,
  ];
}
