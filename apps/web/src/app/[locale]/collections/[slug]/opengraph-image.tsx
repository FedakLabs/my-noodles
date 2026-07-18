import { getTranslations } from 'next-intl/server';

import { fetchCollectionDetail } from '@/api/collections';
import { withPageLocaleResult } from '@/i18n/app-locale/server';
import type { LocalePageProps } from '@/shared/page-props';
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/shared/seo/og-image';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type CollectionOpenGraphImageProps = LocalePageProps<{ slug: string }>;

export default withPageLocaleResult<CollectionOpenGraphImageProps, Awaited<ReturnType<typeof createOgImage>>>(
  async ({ params, locale }) => {
    const { slug } = params;
    const [collection, tMetadata] = await Promise.all([
      fetchCollectionDetail(slug),
      getTranslations({ locale, namespace: 'metadata' }),
    ]);

    return createOgImage({
      eyebrow: tMetadata('title'),
      title: collection.name ?? collection.slug,
      subtitle: collection.description ?? undefined,
    });
  },
  ({ slug }) => createOgImage({ title: slug }),
);

export const generateImageMetadata = withPageLocaleResult<
  CollectionOpenGraphImageProps,
  Array<{ alt: string }>
>(
  async ({ params }) => {
    const collection = await fetchCollectionDetail(params.slug);

    return [{ alt: collection.name ?? collection.slug }];
  },
  ({ slug }) => [{ alt: slug }],
);
