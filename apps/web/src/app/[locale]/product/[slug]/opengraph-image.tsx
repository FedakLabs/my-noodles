import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { fetchProductDetail } from '@/api/products';
import { routing } from '@/i18n/routing';
import { runWithAppLocale } from '@/shared/app-locale/server';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/shared/seo/og-image';
import { formatCurrency } from '@/utils/format-currency';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type ProductOpenGraphImageProps = LocaleSlugPageProps;

export default async function Image({ params }: ProductOpenGraphImageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return createOgImage({ title: slug });
  }

  const [product, tMetadata] = await runWithAppLocale(locale, async () =>
    Promise.all([fetchProductDetail(slug), getTranslations({ locale, namespace: 'metadata' })]),
  );
  const title = product.name ?? product.slug;
  const subtitle = formatCurrency(product.priceMinor, product.currency, locale);

  return createOgImage({
    eyebrow: tMetadata('title'),
    title,
    subtitle,
  });
}

export async function generateImageMetadata({ params }: ProductOpenGraphImageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return [{ alt: slug }];
  }

  const product = await runWithAppLocale(locale, () => fetchProductDetail(slug));

  return [
    {
      alt: product.name ?? product.slug,
    },
  ];
}
