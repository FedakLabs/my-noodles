export type ResolvedSkinSource = 'brand' | 'country' | 'category' | 'hash' | 'base';

export type SkinInput = {
  brand?: string | null;
  country?: string | null;
  category?: string | null;
  slug?: string | null;
};

export type SkinDefinition = {
  bgHueBrand: number;
  accent: string;
  accentHover: string;
  secondary?: string;
  gradientStart: string;
  gradientEnd: string;
};

export type SkinResult = {
  source: ResolvedSkinSource;
  key: string;
  cssVars: Record<string, string>;
  definition: SkinDefinition | null;
};
