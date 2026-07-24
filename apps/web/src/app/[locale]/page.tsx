import { dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';

import { collectionsQueries } from '@/api/collections';
import { countriesQueries } from '@/api/countries';
import { withPageLocale, withPageLocaleMetadata } from '@/i18n/app-locale/server';
import { HomeScreen } from '@/screens/home';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'home' });

  return buildPageMetadata({
    locale,
    pathname: '/',
    title: t('meta.title'),
    description: t('meta.description'),
  });
});

async function HomePage() {
  const queryClient = getQueryClient();

  await runPrefetchSafe(() =>
    Promise.all([
      queryClient.prefetchQuery(collectionsQueries.list(4)),
      queryClient.prefetchQuery(countriesQueries.list()),
    ]),
  );

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <HomeScreen />
    </QueryHydrate>
  );
}

export default withPageLocale(HomePage);
