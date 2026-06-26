import { dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { collectionsQueryKeys, fetchCollectionDetail } from '@/api/collections';
import { fetchProductsList, productsQueryKeys } from '@/api/products';
import { runWithAppLocale } from '@/i18n/app-locale/server';
import { routing } from '@/i18n/routing';
import { DEFAULT_CATALOG_FILTER_PARAMS } from '@/screens/catalog/search-params';
import { CollectionScreen } from '@/screens/collections';
import type { LocaleSlugPageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

export async function generateMetadata({ params }: LocaleSlugPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const collection = await runWithAppLocale(locale, () => fetchCollectionDetail(slug));

  return buildPageMetadata({
    locale,
    pathname: `/collections/${slug}`,
    title: collection.name ?? collection.slug,
    description: collection.description,
  });
}

export default async function CollectionPage({ params }: LocaleSlugPageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return runWithAppLocale(locale, async () => {
    const queryClient = getQueryClient();

    await runPrefetchSafe(async () => {
      const collection = await fetchCollectionDetail(slug);
      const listParams = {
        ...DEFAULT_CATALOG_FILTER_PARAMS,
        page: 1,
        limit: 48,
        collection: collection.code,
      };

      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: collectionsQueryKeys.detail(slug),
          queryFn: () => Promise.resolve(collection),
        }),
        queryClient.prefetchQuery({
          queryKey: productsQueryKeys.list(listParams),
          queryFn: () => fetchProductsList(listParams),
        }),
      ]);
    });

    return (
      <QueryHydrate state={dehydrate(queryClient)}>
        <CollectionScreen slug={slug} />
      </QueryHydrate>
    );
  });
}
