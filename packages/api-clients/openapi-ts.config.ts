import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:3001/api/docs-json',
  output: 'src/storefront/generated',
  plugins: [
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/client-fetch',
      runtimeConfigPath: './src/storefront/client/runtime.config',
    },
    {
      name: '@hey-api/sdk',
      operations: {
        strategy: 'flat',
      },
    },
  ],
});
