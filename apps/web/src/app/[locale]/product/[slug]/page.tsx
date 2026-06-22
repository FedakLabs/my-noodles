import { dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { fetchProductDetail, productsQueryKeys } from '@/api/products';
import { routing } from '@/i18n/routing';
import { ProductScreen } from '@/screens/product';
import { ISR_REVALIDATE_SECONDS } from '@/shared/isr';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate } from '@/shared/query-client';
import { buildPageMetadata, buildProductJsonLd, JsonLdScript } from '@/shared/seo';

export const revalidate = ISR_REVALIDATE_SECONDS;

type ProductPageProps = LocaleSlugPageProps;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const product = await fetchProductDetail(slug, locale);

  return buildPageMetadata({
    locale,
    pathname: `/product/${slug}`,
    title: product.name ?? product.slug,
    description: product.description ?? product.story,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const product = await fetchProductDetail(slug, locale);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: productsQueryKeys.detail(slug, locale),
    queryFn: () => Promise.resolve(product),
  });

  return (
    <>
      <JsonLdScript data={buildProductJsonLd(product, locale)} />
      <QueryHydrate state={dehydrate(queryClient)}>
        <ProductScreen slug={slug} />
      </QueryHydrate>
    </>
  );
}
