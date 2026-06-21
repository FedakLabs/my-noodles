import { dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { collectionsQueryKeys, fetchCollectionDetail } from '@/api/collections';
import { fetchProductsList, productsQueryKeys } from '@/api/products';
import { routing } from '@/i18n/routing';
import { DEFAULT_CATALOG_FILTER_PARAMS } from '@/screens/catalog/search-params';
import { CollectionScreen } from '@/screens/collections';
import { ISR_REVALIDATE_SECONDS } from '@/shared/isr';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate } from '@/shared/query-client';

export const revalidate = ISR_REVALIDATE_SECONDS;

export default async function CollectionPage({ params }: LocaleSlugPageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const queryClient = getQueryClient();
  const collection = await fetchCollectionDetail(slug, locale);
  const listParams = {
    ...DEFAULT_CATALOG_FILTER_PARAMS,
    page: 1,
    limit: 48,
    collection: collection.code,
  };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: collectionsQueryKeys.detail(slug, locale),
      queryFn: () => Promise.resolve(collection),
    }),
    queryClient.prefetchQuery({
      queryKey: productsQueryKeys.list(listParams, locale),
      queryFn: () => fetchProductsList(listParams, locale),
    }),
  ]);

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <CollectionScreen slug={slug} />
    </QueryHydrate>
  );
}
