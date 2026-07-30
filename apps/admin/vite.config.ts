import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createBaseViteConfig } from '@my-noodles/vite-config/base';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default createBaseViteConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  server: {
    port: 3002,
  },
  preview: {
    port: 3002,
  },
});
