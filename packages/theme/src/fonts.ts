/**
 * Canonical font contract for the design system — single place to change fonts.
 *
 * Drives:
 * - packages/theme/src/fonts.local.css — pinned @font-face rules (self-hosted .woff2)
 * - packages/theme/src/fonts.css — CSS variable fallbacks
 * - packages/theme/src/typography.ts — MUI fontFamily tokens
 *
 * Replace files under src/assets/fonts/ manually when updating the typeface.
 */
export type FontLocalFace = Readonly<{
  file: string;
  unicodeRange: string;
}>;

export const fonts = {
  display: {
    family: 'Unbounded',
    cssVariable: '--font-display',
    weightRange: '400 600',
    weights: ['400', '500', '600'] as const,
    localFaces: [
      {
        file: 'unbounded-latin.woff2',
        unicodeRange:
          'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
      },
      {
        file: 'unbounded-latin-ext.woff2',
        unicodeRange:
          'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
      },
      {
        file: 'unbounded-cyrillic.woff2',
        unicodeRange: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
      },
    ] as const satisfies readonly FontLocalFace[],
    usage: 'h1–h2 display headings',
  },
  body: {
    family: 'Manrope',
    cssVariable: '--font-body',
    weightRange: '200 800',
    weights: ['400', '500', '600', '700'] as const,
    localFaces: [
      {
        file: 'manrope-latin.woff2',
        unicodeRange:
          'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
      },
      {
        file: 'manrope-latin-ext.woff2',
        unicodeRange:
          'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
      },
      {
        file: 'manrope-cyrillic.woff2',
        unicodeRange: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
      },
    ] as const satisfies readonly FontLocalFace[],
    usage: 'body copy, UI labels, h3–h6',
  },
} as const;

export type FontRole = keyof typeof fonts;

export function fontFamilyFallback(role: FontRole): string {
  return `'${fonts[role].family}', system-ui, sans-serif`;
}

export function fontCssVariableReference(role: FontRole): string {
  return `var(${fonts[role].cssVariable}, ${fontFamilyFallback(role)})`;
}
