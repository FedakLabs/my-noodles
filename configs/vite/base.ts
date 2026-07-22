import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

/** Default Vite preset for React SPAs — React + SVGR (`.svg` → React components). */
export const packageViteConfig = defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        exportType: 'default',
        icon: true,
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
