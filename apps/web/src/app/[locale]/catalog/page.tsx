import { dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';

import { productsQueries, resolvePaginatedProductsPage } from '@/api/products';
import {
  CATALOG_VIEW_MODE_COOKIE,
  isCatalogViewMode,
  parseCatalogViewMode,
} from '@/components/catalog-view-mode';
import { withPageLocale, withPageLocaleMetadata, type WithPageLocaleProps } from '@/i18n/app-locale/server';
import { CatalogScreen } from '@/screens/catalog';
import { catalogSearchParamsCache, toCatalogInfiniteListParams } from '@/screens/catalog/search-params';
import type { LocalePageProps, PageSearchParams } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

type CatalogPageProps = LocalePageProps<object, PageSearchParams>;

export const generateMetadata = withPageLocaleMetadata<CatalogPageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'catalog' });

  return buildPageMetadata({
    locale,
    pathname: '/catalog',
    title: t('title'),
    description: t('metaDescription'),
  });
});

async function CatalogPage({ searchParams }: WithPageLocaleProps<CatalogPageProps>) {
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get(CATALOG_VIEW_MODE_COOKIE)?.value;
  const initialViewMode = parseCatalogViewMode(viewModeCookie);
  const hasViewModePreference = isCatalogViewMode(viewModeCookie);

  const searchParamsParsed = await catalogSearchParamsCache.parse(searchParams);
  const infiniteListParams = toCatalogInfiniteListParams(searchParamsParsed);

  const queryClient = getQueryClient();

  await runPrefetchSafe(async () => {
    if (initialViewMode === 'pagination') {
      const pageData = await queryClient.fetchQuery(productsQueries.list(searchParamsParsed));
      const { merged, storageKey } = await resolvePaginatedProductsPage(
        queryClient,
        searchParamsParsed,
        pageData,
      );

      await queryClient.prefetchQuery({
        queryKey: [...storageKey, searchParamsParsed.page],
        queryFn: () => merged,
      });
    } else {
      await queryClient.fetchInfiniteQuery(productsQueries.infiniteList(infiniteListParams));
    }
  });

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <CatalogScreen initialViewMode={initialViewMode} hasViewModePreference={hasViewModePreference} />
    </QueryHydrate>
  );
}

export default withPageLocale(CatalogPage);
