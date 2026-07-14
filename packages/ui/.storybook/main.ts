import { dirname } from 'path';
import { fileURLToPath } from 'url';

import type { StorybookConfig } from '@storybook/react-vite';
import svgr from 'vite-plugin-svgr';

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-docs')],
  framework: getAbsolutePath('@storybook/react-vite'),
  viteFinal: async (config) => {
    config.plugins = [
      ...(config.plugins ?? []),
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
    ];
    return config;
  },
};

export default config;
