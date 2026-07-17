import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const svgrLoader = {
  loader: '@svgr/webpack',
  options: {
    icon: true,
    svgoConfig: {
      plugins: [{ name: 'removeViewBox', active: false }],
    },
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
        loaders: [svgrLoader],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [svgrLoader],
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
