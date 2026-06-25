import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { fetchCollectionDetail } from '@/api/collections';
import { routing } from '@/i18n/routing';
import { runWithAppLocale } from '@/shared/app-locale/server';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/shared/seo/og-image';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type CollectionOpenGraphImageProps = LocaleSlugPageProps;

export default async function Image({ params }: CollectionOpenGraphImageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return createOgImage({ title: slug });
  }

  const [collection, tMetadata] = await runWithAppLocale(locale, async () =>
    Promise.all([fetchCollectionDetail(slug), getTranslations({ locale, namespace: 'metadata' })]),
  );

  return createOgImage({
    eyebrow: tMetadata('title'),
    title: collection.name ?? collection.slug,
    subtitle: collection.description ?? undefined,
  });
}

export async function generateImageMetadata({ params }: CollectionOpenGraphImageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return [{ alt: slug }];
  }

  const collection = await runWithAppLocale(locale, () => fetchCollectionDetail(slug));

  return [
    {
      alt: collection.name ?? collection.slug,
    },
  ];
}
