import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
  transpilePackages: ['@my-noodles/theme', '@my-noodles/web-lib', '@my-noodles/ui', 'mui-tel-input'],
  turbopack: {
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
