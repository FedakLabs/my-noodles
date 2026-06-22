import type { Colors } from '@my-noodles/theme';
import { colors as baseThemeColors } from '@my-noodles/theme';

import type { SkinDefinition } from './types';

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${alpha})`;
}

export function skinDefinitionToCssVars(definition: SkinDefinition): Record<string, string> {
  const gradientStart = withAlpha(definition.gradientStart, 0.15);
  const gradientEnd = withAlpha(definition.gradientEnd, 0.08);

  return {
    '--colors-surface-bg-hue-brand': String(definition.bgHueBrand),
    '--colors-button-fill-primary': definition.accent,
    '--colors-button-fill-primary-hover': definition.accentHover,
    '--colors-icon-accent': definition.accent,
    '--skin-gradient-start': gradientStart,
    '--skin-gradient-end': gradientEnd,
    '--skin-card-gradient': `linear-gradient(180deg, ${gradientStart} 0%, ${gradientEnd} 45%, transparent 45%)`,
    ...(definition.secondary ? { '--colors-tag-secondary': definition.secondary } : {}),
  };
}

export function hashSlugToSkinDefinition(slug: string): SkinDefinition {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }

  const hue = hash % 360;
  const saturation = 40 + (hash % 21);
  const lightness = 50 + (hash % 11);
  const accent = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness)}%)`;
  const accentHover = `hsl(${String(hue)}, ${String(saturation)}%, ${String(lightness - 8)}%)`;

  return {
    bgHueBrand: hue,
    accent,
    accentHover,
    gradientStart: accent,
    gradientEnd: `hsl(${String(hue)}, ${String(Math.max(saturation - 15, 25))}%, ${String(lightness + 12)}%)`,
  };
}

export function colorsToCssVars(colorTokens: Colors): Record<string, string> {
  return {
    '--colors-text-primary': colorTokens.text.primary,
    '--colors-text-secondary': colorTokens.text.secondary,
    '--colors-text-disabled': colorTokens.text.disabled,
    '--colors-text-inverse': colorTokens.text.inverse,
    '--colors-icon-primary': colorTokens.icon.primary,
    '--colors-icon-secondary': colorTokens.icon.secondary,
    '--colors-icon-accent': colorTokens.icon.accent,
    '--colors-surface-page': colorTokens.surface.page,
    '--colors-surface-card': colorTokens.surface.card,
    '--colors-surface-elevated': colorTokens.surface.elevated,
    '--colors-surface-bg-hue-brand': String(colorTokens.surface.bgHueBrand),
    '--colors-border-subtle': colorTokens.border.subtle,
    '--colors-border-strong': colorTokens.border.strong,
    '--colors-border-focus': colorTokens.border.focus,
    '--colors-button-fill-primary': colorTokens.buttonFill.primary,
    '--colors-button-fill-primary-hover': colorTokens.buttonFill.primaryHover,
    '--colors-button-fill-secondary': colorTokens.buttonFill.secondary,
    '--colors-button-fill-disabled': colorTokens.buttonFill.disabled,
  };
}

export const baseSkinCssVars = colorsToCssVars(baseThemeColors);
