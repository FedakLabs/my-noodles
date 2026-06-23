import { pagePaginatedGetNextPageParam } from '@my-noodles/web-lib/react-query';
import { dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { fetchProductsList, productsQueryKeys } from '@/api/products';
import {
  CATALOG_VIEW_MODE_COOKIE,
  hasCatalogViewModePreference,
  parseCatalogViewMode,
} from '@/components/catalog-view-mode';
import { routing } from '@/i18n/routing';
import { CatalogScreen } from '@/screens/catalog';
import { catalogSearchParamsCache, toCatalogInfiniteListParams } from '@/screens/catalog/search-params';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

type CatalogPageProps = LocalePageProps & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<CatalogPageProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'catalog' });

  return buildPageMetadata({
    locale,
    pathname: '/catalog',
    title: t('title'),
    description: t('metaDescription'),
  });
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get(CATALOG_VIEW_MODE_COOKIE)?.value;
  const initialViewMode = parseCatalogViewMode(viewModeCookie);
  const hasViewModePreference = hasCatalogViewModePreference(viewModeCookie);

  const searchParamsParsed = await catalogSearchParamsCache.parse(searchParams);
  const infiniteListParams = toCatalogInfiniteListParams(searchParamsParsed);
  const queryClient = getQueryClient();
  const getNextPageParam = pagePaginatedGetNextPageParam();

  if (initialViewMode === 'pagination') {
    await queryClient.prefetchQuery({
      queryKey: productsQueryKeys.list(searchParamsParsed, locale),
      queryFn: () => fetchProductsList(searchParamsParsed, locale),
    });
  } else {
    await queryClient.fetchInfiniteQuery({
      queryKey: productsQueryKeys.infiniteList(infiniteListParams, locale),
      queryFn: ({ pageParam }) => fetchProductsList({ ...infiniteListParams, page: pageParam }, locale),
      initialPageParam: 1,
      getNextPageParam,
    });
  }

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <CatalogScreen initialViewMode={initialViewMode} hasViewModePreference={hasViewModePreference} />
    </QueryHydrate>
  );
}
