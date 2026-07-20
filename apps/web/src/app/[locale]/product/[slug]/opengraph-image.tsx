import { getTranslations } from 'next-intl/server';

import { productsQueries } from '@/api/products';
import { withPageLocaleResult } from '@/i18n/app-locale/server';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient } from '@/shared/query-client';
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/shared/seo/og-image';
import { formatCurrency } from '@/utils/format-currency';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type ProductOpenGraphImageProps = LocalePageProps<{ slug: string }>;

export default withPageLocaleResult<ProductOpenGraphImageProps, Awaited<ReturnType<typeof createOgImage>>>(
  async ({ params, locale }) => {
    const { slug } = params;
    const [product, tMetadata] = await Promise.all([
      getQueryClient().fetchQuery(productsQueries.detail(slug)),
      getTranslations({ locale, namespace: 'metadata' }),
    ]);
    const title = product.name ?? product.slug;
    const subtitle = formatCurrency(product.priceMinor, product.currency, locale);

    return await createOgImage({
      eyebrow: tMetadata('title'),
      title,
      subtitle,
    });
  },
  ({ slug }) => createOgImage({ title: slug }),
);

export const generateImageMetadata = withPageLocaleResult<ProductOpenGraphImageProps, Array<{ alt: string }>>(
  async ({ params }) => {
    const product = await getQueryClient().fetchQuery(productsQueries.detail(params.slug));

    return [{ alt: product.name ?? product.slug }];
  },
  ({ slug }) => [{ alt: slug }],
);
