/// <reference types="vite/types/importMeta.d.ts" />
/// <reference types="@my-noodles/ui/types" />

// Asset modules from vite/client — except `*.svg`, which comes from `@my-noodles/ui/types` as React components.
declare module '*.css' {}
