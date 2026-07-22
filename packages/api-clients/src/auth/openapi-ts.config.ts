import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  /** Prefer checked-in OpenAPI so generation does not require a running API. */
  input: '../../apps/api/src/openapi/openapi-auth.json',
  /** Relative to package root (`pnpm --dir packages/api-clients …`). */
  output: 'src/auth/generated',
  plugins: [
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/client-fetch',
      throwOnError: true,
    },
    {
      name: '@hey-api/sdk',
      responseStyle: 'data',
      operations: {
        strategy: 'flat',
      },
    },
  ],
});
