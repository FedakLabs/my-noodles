import path from 'node:path';

import { createBaseVitestConfig } from '@my-noodles/vitest-config/base';

export default createBaseVitestConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.tsx', 'src/**/~*.test.ts'],
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    },
  },
});
