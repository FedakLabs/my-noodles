import svgIconTemplate from './svg-icon-template.mjs';

export { default as svgIconTemplate } from './svg-icon-template.mjs';

/** Core options shared by Vite and `@svgr/webpack` (webpack path). */
export const svgIconSvgrOptions = {
  icon: true as const,
  // SVGR's `tpl` return type is a Babel AST; keep loose so we don't depend on @svgr/core types here.
  template: svgIconTemplate as never,
};

/**
 * JSON-safe options for Next Turbopack (no functions).
 * Storefront uses `apps/web/svg-icon-svgr-loader.mjs` to bake in the template —
 * Turbopack cannot serialize `template`, and SVGR `configFile` is unreliable there.
 */
export const svgIconSvgrJsonOptions = {
  icon: true as const,
};
