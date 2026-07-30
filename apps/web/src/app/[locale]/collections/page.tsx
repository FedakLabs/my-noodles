import { dehydrate } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';

import { COLLECTIONS_PAGE_LIMIT, collectionsQueries } from '@/api/collections';
import { withPageLocale, withPageLocaleMetadata } from '@/i18n/app-locale/server';
import { CollectionsScreen } from '@/screens/collections';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'collections' });

  return buildPageMetadata({
    locale,
    pathname: '/collections',
    title: t('title'),
    description: t('description'),
  });
});

async function CollectionsPage() {
  const queryClient = getQueryClient();

  await runPrefetchSafe(() =>
    queryClient.prefetchInfiniteQuery(collectionsQueries.infiniteList({ limit: COLLECTIONS_PAGE_LIMIT })),
  );

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <CollectionsScreen />
    </QueryHydrate>
  );
}

export default withPageLocale(CollectionsPage);
