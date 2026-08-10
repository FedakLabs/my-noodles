import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { svgIconSvgrOptions } from '@my-noodles/vite-config/svgr';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const svgoConfig = {
  plugins: [{ name: 'removeViewBox', active: false }],
};

/** Webpack can take an inline `template` function in loader options. */
const svgrWebpackLoader = {
  loader: '@svgr/webpack',
  options: {
    ...svgIconSvgrOptions,
    runtimeConfig: false,
    svgoConfig,
  },
};

/**
 * Turbopack: JSON-only options; size/color template is baked into this app-local loader
 * (path must resolve from `apps/web`, not `turbopack.root`).
 */
const svgrTurbopackLoader = {
  loader: './svg-icon-svgr-loader.mjs',
  options: {
    icon: true,
    svgoConfig,
  },
};

const nextConfig: NextConfig = {
  // Required for apps/web/Dockerfile (minimal Node image via `.next/standalone`).
  output: 'standalone',
  // Trace files outside apps/web (workspace packages) into the standalone bundle.
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: [
    '@my-noodles/theme',
    '@my-noodles/web-lib',
    '@my-noodles/ui',
    '@my-noodles/utils',
    '@my-noodles/api-clients',
    'mui-tel-input',
  ],
  turbopack: {
    // Pin the workspace root so Turbopack doesn't mis-detect / over-watch the tree.
    root: monorepoRoot,
    rules: {
      '*.svg': {
        loaders: [svgrTurbopackLoader],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [svgrWebpackLoader],
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
