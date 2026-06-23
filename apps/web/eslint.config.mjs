import { createWebConfig } from '@my-noodles/eslint-config/web';

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'vitest.config.ts',
      'playwright.config.ts',
      'next.config.ts',
      'next-env.d.ts',
      'e2e/mock-api.mjs',
    ],
  },
  ...createWebConfig(import.meta.dirname),
];
