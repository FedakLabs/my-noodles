import type { SVGProps } from 'react';

/** Props for SVGR icon components (`size` / `color`; color defaults to `'inherit'`). */
export type SvgIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  /** Defaults to `'inherit'` at runtime (SVGR template). */
  color?: string;
};
