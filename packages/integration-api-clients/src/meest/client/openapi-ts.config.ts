import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://wiki.meest-group.com/api/files/openAPI_ua.json?v=90456',
  /** Relative to package root (`pnpm --dir packages/integration-api-clients …`). */
  output: 'src/meest/client/generated',
  plugins: [
    {
      enums: 'javascript',
      name: '@hey-api/typescript',
    },
    {
      name: '@hey-api/client-fetch',
    },
    {
      name: '@hey-api/sdk',
      operations: {
        strategy: 'flat',
      },
    },
  ],
});
