export type ResolvedSkinSource = 'brand' | 'country' | 'category' | 'hash' | 'base';

export type SkinInput = {
  brand?: string | null | undefined;
  country?: string | null | undefined;
  category?: string | null | undefined;
  slug?: string | null | undefined;
};

export type SkinDefinition = {
  bgHueBrand: number;
  accent: string;
  accentHover: string;
  secondary?: string | undefined;
  gradientStart: string;
  gradientEnd: string;
};

export type SkinResult = {
  source: ResolvedSkinSource;
  key: string;
  cssVars: Record<string, string>;
  definition: SkinDefinition | null;
};
