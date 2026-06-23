import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import type { LocalePageProps } from '@/shared/page-props';
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/shared/seo/og-image';

export const alt = 'MyNoodles';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type LocaleOpenGraphImageProps = Pick<LocalePageProps, 'params'>;

export default async function Image({ params }: LocaleOpenGraphImageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return createOgImage({ title: 'MyNoodles' });
  }

  const [tHome, tMetadata] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);

  return createOgImage({
    eyebrow: tMetadata('title'),
    title: tHome('title'),
    subtitle: tHome('description'),
  });
}
