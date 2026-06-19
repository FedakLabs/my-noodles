import { baseColors } from '../palette';
import type { SkinDefinition } from './types';

function skin(
  bgHueBrand: number,
  accent: string,
  accentHover: string,
  gradientStart: string,
  gradientEnd: string,
  secondary?: string,
): SkinDefinition {
  return {
    bgHueBrand,
    accent,
    accentHover,
    gradientStart,
    gradientEnd,
    ...(secondary ? { secondary } : {}),
  };
}

/** Country skins — ISO 3166-1 alpha-2 codes. */
export const countrySkins: Record<string, SkinDefinition> = {
  CN: skin(0, '#C0392B', '#A93226', '#C0392B', baseColors.gold, baseColors.gold),
  KR: skin(320, baseColors.rose, '#D63D7E', baseColors.rose, baseColors.violet),
  TH: skin(38, baseColors.mango, '#C98912', baseColors.mango, baseColors.teal, baseColors.teal),
  US: skin(355, baseColors.cherry, '#B91C1C', baseColors.cherry, baseColors.navy, baseColors.navy),
  CA: skin(28, baseColors.maple, '#B45309', baseColors.maple, baseColors.pine, baseColors.pine),
  TW: skin(340, baseColors.bubbleTea, '#DB2777', baseColors.bubbleTea, baseColors.jade, baseColors.jade),
};

/** Brand skins — keyed by normalized brand slug / themeKey. */
export const brandSkins: Record<string, SkinDefinition> = {
  BULDAK: skin(350, '#C41E3A', '#A01830', '#C41E3A', baseColors.mango, baseColors.mango),
  POCKY: skin(345, baseColors.bubbleTea, '#DB2777', baseColors.bubbleTea, baseColors.rose),
  PRINGLES: skin(42, baseColors.gold, '#B8943F', baseColors.gold, baseColors.maple, baseColors.maple),
};

/** Category skins — keyed by normalized category slug / themeKey. */
export const categorySkins: Record<string, SkinDefinition> = {
  NOODLES: skin(
    18,
    baseColors.terracotta,
    baseColors.terracottaHover,
    baseColors.terracotta,
    baseColors.mango,
    baseColors.mango,
  ),
  SWEETS: skin(330, baseColors.bubbleTea, '#DB2777', baseColors.bubbleTea, baseColors.rose),
  DRINKS: skin(195, baseColors.teal, '#238276', baseColors.teal, baseColors.jade, baseColors.jade),
};

export function normalizeSkinKey(value: string): string {
  return value.trim().toUpperCase();
}
