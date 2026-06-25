import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../apps/api/src/openapi/openapi.json',
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
