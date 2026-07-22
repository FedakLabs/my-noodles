import { dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';

import { collectionsQueries } from '@/api/collections';
import { productsQueries } from '@/api/products';
import { withPageLocale, withPageLocaleMetadata } from '@/i18n/app-locale/server';
import { HomeScreen } from '@/screens/home';
import {
  LANDING_FACETS_PARAMS,
  LANDING_HERO_PRODUCTS_PARAMS,
  LANDING_TRIED_COUNT_PARAMS,
} from '@/screens/home/landing-query-params';
import { getLandingVariant } from '@/shared/experiment/get-landing-variant';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'home' });

  return buildPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  });
});

async function HomePage() {
  const { variant, source } = await getLandingVariant();
  const queryClient = getQueryClient();

  await runPrefetchSafe(async () => {
    const tasks: Promise<unknown>[] = [
      queryClient.prefetchQuery(productsQueries.list(LANDING_HERO_PRODUCTS_PARAMS)),
      queryClient.prefetchQuery(productsQueries.list(LANDING_TRIED_COUNT_PARAMS)),
      queryClient.prefetchQuery(productsQueries.facets(LANDING_FACETS_PARAMS)),
    ];

    if (variant === 'a') {
      tasks.push(queryClient.prefetchQuery(collectionsQueries.list()));
    }

    await Promise.all(tasks);
  });

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <HomeScreen variant={variant} source={source} />
    </QueryHydrate>
  );
}

export default withPageLocale(HomePage);
