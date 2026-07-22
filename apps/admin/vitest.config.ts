import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createBaseVitestConfig } from '@my-noodles/vitest-config/base';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createBaseVitestConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.tsx'],
  },
});
