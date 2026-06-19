import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import { defineConfig } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

/** Shared base rules — extended by web/node presets; prettier ESLint layer applied in each preset last. */
export function createBaseConfig(tsconfigRootDir) {
  return defineConfig(
    {
      ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/coverage/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    {
      plugins: {
        'simple-import-sort': simpleImportSort,
        '@nx': nx,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: 'type:app',
                onlyDependOnLibsWithTags: ['type:lib', 'type:config'],
              },
              {
                sourceTag: 'scope:web',
                notDependOnLibsWithTags: ['scope:api'],
              },
              {
                sourceTag: 'scope:packages',
                onlyDependOnLibsWithTags: ['scope:packages', 'scope:configs'],
              },
            ],
          },
        ],
      },
    },
  );
}
