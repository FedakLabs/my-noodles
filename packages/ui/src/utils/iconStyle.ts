import type { CSSProperties } from 'react';

export type IconStyleInput = {
  size: number;
  color?: string;
};

/** Size and color for SVGR icons — strokes use `currentColor` from `style.color`. */
export function iconStyle({ size, color }: IconStyleInput): CSSProperties {
  return {
    width: size,
    height: size,
    flexShrink: 0,
    ...(color !== undefined ? { color } : {}),
  };
}
