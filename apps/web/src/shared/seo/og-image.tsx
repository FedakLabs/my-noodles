import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = 'image/png';

const THEME_FONTS_DIR = join(process.cwd(), '../../packages/theme/src/assets/fonts');

let ogFontsPromise: Promise<Array<{ name: string; data: Buffer; weight: 400 | 700 }>> | undefined;

async function loadOgFonts() {
  if (!ogFontsPromise) {
    ogFontsPromise = Promise.all([
      readFile(join(THEME_FONTS_DIR, 'unbounded-cyrillic.woff2')),
      readFile(join(THEME_FONTS_DIR, 'manrope-cyrillic.woff2')),
    ]).then(([displayFont, bodyFont]) => [
      { name: 'Unbounded', data: displayFont, weight: 700 as const },
      { name: 'Manrope', data: bodyFont, weight: 400 as const },
    ]);
  }

  return ogFontsPromise;
}

type CreateOgImageOptions = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export async function createOgImage({
  eyebrow,
  title,
  subtitle,
}: CreateOgImageOptions): Promise<ImageResponse> {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffe4d6 45%, #ffd6e8 100%)',
        color: '#1f130f',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {eyebrow ? (
          <div
            style={{
              fontFamily: 'Manrope',
              fontSize: 28,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8b4b38',
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: 'Unbounded',
            fontSize: title.length > 48 ? 56 : 72,
            lineHeight: 1.05,
            fontWeight: 700,
            maxWidth: '980px',
          }}
        >
          {title}
        </div>
      </div>
      {subtitle ? (
        <div
          style={{
            fontFamily: 'Manrope',
            fontSize: 34,
            lineHeight: 1.35,
            color: '#5c3d34',
            maxWidth: '920px',
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts,
    },
  );
}
