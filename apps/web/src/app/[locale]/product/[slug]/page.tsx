import type { ProductDetailDto } from '@my-noodles/api-clients/storefront';
import { dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { fetchProductDetail, productsQueryKeys } from '@/api/products';
import { runWithAppLocale } from '@/i18n/app-locale/server';
import { routing } from '@/i18n/routing';
import { ProductScreen } from '@/screens/product';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata, buildProductJsonLd, JsonLdScript } from '@/shared/seo';

type ProductPageProps = LocaleSlugPageProps;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const product = await runWithAppLocale(locale, () => fetchProductDetail(slug));

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

  return runWithAppLocale(locale, async () => {
    const queryClient = getQueryClient();

    await runPrefetchSafe(async () => {
      const product = await fetchProductDetail(slug);

      await queryClient.prefetchQuery({
        queryKey: productsQueryKeys.detail(slug),
        queryFn: () => Promise.resolve(product),
      });
    });

    const product = queryClient.getQueryData<ProductDetailDto>(productsQueryKeys.detail(slug));

    return (
      <>
        {product ? <JsonLdScript data={buildProductJsonLd(product, locale)} /> : null}
        <QueryHydrate state={dehydrate(queryClient)}>
          <ProductScreen slug={slug} />
        </QueryHydrate>
      </>
    );
  });
}
