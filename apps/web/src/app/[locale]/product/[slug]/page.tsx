import { dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { fetchProductDetail, productsQueryKeys } from '@/api/products';
import { routing } from '@/i18n/routing';
import { ProductScreen } from '@/screens/product';
import { ISR_REVALIDATE_SECONDS } from '@/shared/isr';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate } from '@/shared/query-client';

export const revalidate = ISR_REVALIDATE_SECONDS;

type ProductPageProps = LocaleSlugPageProps;

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: productsQueryKeys.detail(slug, locale),
    queryFn: () => fetchProductDetail(slug, locale),
  });

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <ProductScreen slug={slug} />
    </QueryHydrate>
  );
}
