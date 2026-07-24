/**
 * Turbopack-safe SVGR loader for the storefront: bakes in size/color template.
 *
 * Lives under `apps/web` so Turbopack can `require.resolve('./svg-icon-svgr-loader.mjs')`
 * from the Next app dir. Shared template stays in `@my-noodles/vite-config`.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import svgIconTemplate from '../../configs/vite/svg-icon-template.mjs';

const require = createRequire(fileURLToPath(import.meta.url));
const svgrWebpack = require('@svgr/webpack');

export default function svgIconSvgrLoader(contents) {
  const baseOptions = typeof this.getOptions === 'function' ? this.getOptions() : {};

  this.getOptions = () => ({
    ...baseOptions,
    icon: true,
    template: svgIconTemplate,
    // Template is provided inline — skip cosmiconfig (avoids Turbopack filePath gaps).
    runtimeConfig: false,
  });

  return svgrWebpack.call(this, contents);
}
