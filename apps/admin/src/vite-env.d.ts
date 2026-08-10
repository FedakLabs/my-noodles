/// <reference types="vite/types/importMeta.d.ts" />
/// <reference types="@my-noodles/ui/types" />

// Asset modules from vite/client — except `*.svg`, which comes from `@my-noodles/ui/types` as React components.
declare module '*.css' {}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AUTH_API_URL: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
