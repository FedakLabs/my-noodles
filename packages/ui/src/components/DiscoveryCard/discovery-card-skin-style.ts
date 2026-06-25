import type { CSSProperties } from 'react';

import { type SkinResult, skinVarsToStyle } from '../../utils/skins';

export function discoveryCardSkinStyle(skin?: SkinResult): CSSProperties | undefined {
  return skin ? skinVarsToStyle(skin.cssVars) : undefined;
}
