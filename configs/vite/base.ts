import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import { svgIconSvgrOptions } from '@my-noodles/vite-config/svgr';

/** Default Vite preset for React SPAs — React + SVGR (`.svg` → React components). */
export const packageViteConfig = defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        ...svgIconSvgrOptions,
        exportType: 'default',
        svgoConfig: {
          plugins: [{ name: 'removeViewBox' }],
        },
      },
    }),
  ],
});

export function createBaseViteConfig(overrides: UserConfig = {}) {
  return mergeConfig(packageViteConfig, overrides);
}
