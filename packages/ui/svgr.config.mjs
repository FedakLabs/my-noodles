import template from '../../configs/vite/svg-icon-template.mjs';

/**
 * Optional cosmiconfig entry for SVGR tooling.
 * Next Turbopack uses `apps/web/svg-icon-svgr-loader.mjs` instead (template must be
 * in-process — loader options cannot carry functions).
 */
export default {
  icon: true,
  template,
};
