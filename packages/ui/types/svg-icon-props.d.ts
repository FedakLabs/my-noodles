import type { SVGProps } from 'react';

/** Props for SVGR icon components (`size` / `color`; defaults via SVGR template). */
export type SvgIconProps = SVGProps<SVGSVGElement> & {
  /** Defaults to `16` at runtime (SVGR template). */
  size?: number;
  /** Defaults to `'inherit'` at runtime (SVGR template). */
  color?: string;
};
