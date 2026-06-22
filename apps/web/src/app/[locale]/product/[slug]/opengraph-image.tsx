import { hasLocale } from 'next-intl';

import { fetchProductDetail } from '@/api/products';
import { routing } from '@/i18n/routing';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { createOgImage, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from '@/shared/seo';
import { formatCurrency } from '@/utils/format-currency';

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type ProductOpenGraphImageProps = LocaleSlugPageProps;

export default async function Image({ params }: ProductOpenGraphImageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return createOgImage({ title: slug });
  }

  const product = await fetchProductDetail(slug, locale);
  const title = product.name ?? product.slug;
  const subtitle = formatCurrency(product.priceMinor, product.currency, locale);

  return createOgImage({
    eyebrow: 'my-noodles',
    title,
    subtitle,
  });
}

export async function generateImageMetadata({ params }: ProductOpenGraphImageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return [{ alt: slug }];
  }

  const product = await fetchProductDetail(slug, locale);

  return [
    {
      alt: product.name ?? product.slug,
    },
  ];
}
