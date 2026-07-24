import { getTranslations } from 'next-intl/server';

import { withPageLocaleResult } from '@/i18n/app-locale/server';
import type { LocalePageProps } from '@/shared/page-props';
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/shared/seo/og-image';

export const alt = 'MyNoodles';
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type LocaleOpenGraphImageProps = Pick<LocalePageProps, 'params'>;

export default withPageLocaleResult<LocaleOpenGraphImageProps, Awaited<ReturnType<typeof createOgImage>>>(
  async ({ locale }) => {
    const [tHome, tMetadata] = await Promise.all([
      getTranslations({ locale, namespace: 'home' }),
      getTranslations({ locale, namespace: 'metadata' }),
    ]);

    return await createOgImage({
      eyebrow: tMetadata('title'),
      title: tHome('meta.title'),
      subtitle: tHome('meta.description'),
    });
  },
  () => createOgImage({ title: 'MyNoodles' }),
);
