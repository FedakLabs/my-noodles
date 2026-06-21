import { dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { fetchProductFacets, fetchProductsList, productsQueryKeys } from '@/api/products';
import { routing } from '@/i18n/routing';
import { CatalogScreen } from '@/screens/catalog';
import { catalogSearchParamsCache, toCatalogFacetsParams } from '@/screens/catalog/search-params';
import { ISR_REVALIDATE_SECONDS } from '@/shared/isr';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate } from '@/shared/query-client';

export const revalidate = ISR_REVALIDATE_SECONDS;

type CatalogPageProps = LocalePageProps & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const searchParamsParsed = await catalogSearchParamsCache.parse(searchParams);
  const { page: _page, limit: _limit, ...filterParams } = searchParamsParsed;
  const facetsParams = toCatalogFacetsParams(filterParams);
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productsQueryKeys.list(searchParamsParsed, locale),
      queryFn: () => fetchProductsList(searchParamsParsed, locale),
    }),
    queryClient.prefetchQuery({
      queryKey: productsQueryKeys.facets(facetsParams, locale),
      queryFn: () => fetchProductFacets(facetsParams, locale),
    }),
  ]);

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <CatalogScreen />
    </QueryHydrate>
  );
}
