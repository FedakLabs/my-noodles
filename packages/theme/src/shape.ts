import type { CSSProperties } from 'react';

import type { BorderRadiusTokens } from './types';

export const borderRadius: BorderRadiusTokens = {
  none: 0,
  utility: 12,
  discovery: 20,
  sheet: 24,
  pill: 9999,
};

export type EdgeAnchor = 'left' | 'right' | 'bottom' | 'top';

/** Bottom/top sheets: rounded on the edge away from the viewport. Left/right sidebars: fully square. */
export function edgeAnchoredBorderRadius(
  anchor: EdgeAnchor,
  radius: BorderRadiusTokens = borderRadius,
): Pick<
  CSSProperties,
  'borderTopLeftRadius' | 'borderTopRightRadius' | 'borderBottomLeftRadius' | 'borderBottomRightRadius'
> {
  switch (anchor) {
    case 'bottom':
      return {
        borderTopLeftRadius: radius.sheet,
        borderTopRightRadius: radius.sheet,
        borderBottomLeftRadius: radius.none,
        borderBottomRightRadius: radius.none,
      };
    case 'top':
      return {
        borderBottomLeftRadius: radius.sheet,
        borderBottomRightRadius: radius.sheet,
        borderTopLeftRadius: radius.none,
        borderTopRightRadius: radius.none,
      };
    case 'left':
    case 'right':
      return {
        borderTopLeftRadius: radius.none,
        borderTopRightRadius: radius.none,
        borderBottomLeftRadius: radius.none,
        borderBottomRightRadius: radius.none,
      };
  }
}
