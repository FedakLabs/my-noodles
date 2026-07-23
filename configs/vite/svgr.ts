import svgIconTemplate from './svg-icon-template.mjs';

export { default as svgIconTemplate } from './svg-icon-template.mjs';

/** Core options shared by Vite and `@svgr/webpack` (webpack path). */
export const svgIconSvgrOptions = {
  icon: true as const,
  // SVGR's `tpl` return type is a Babel AST; keep loose so we don't depend on @svgr/core types here.
  template: svgIconTemplate as never,
};

/**
 * JSON-safe options for Next Turbopack loaders (no functions).
 * Template is loaded from `packages/ui/svgr.config.mjs` via SVGR runtime config.
 */
export const svgIconSvgrJsonOptions = {
  icon: true as const,
};
