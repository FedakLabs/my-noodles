import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { svgIconSvgrJsonOptions, svgIconSvgrOptions } from '@my-noodles/vite-config/svgr';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const svgoConfig = {
  plugins: [{ name: 'removeViewBox', active: false }],
};

/** Webpack accepts a function `template`; Turbopack loader options must be JSON-only. */
const svgrWebpackLoader = {
  loader: '@svgr/webpack',
  options: {
    ...svgIconSvgrOptions,
    svgoConfig,
  },
};

const svgrTurbopackLoader = {
  loader: '@svgr/webpack',
  options: {
    ...svgIconSvgrJsonOptions,
    svgoConfig,
  },
};

const nextConfig: NextConfig = {
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
