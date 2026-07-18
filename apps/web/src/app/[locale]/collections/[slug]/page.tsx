import { dehydrate } from '@tanstack/react-query';

import { collectionsQueries, fetchCollectionDetail } from '@/api/collections';
import { productsQueries } from '@/api/products';
import { withPageLocale, withPageLocaleMetadata, type WithPageLocaleProps } from '@/i18n/app-locale/server';
import { DEFAULT_CATALOG_FILTER_PARAMS } from '@/screens/catalog/search-params';
import { CollectionScreen } from '@/screens/collections';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

type CollectionPageProps = LocalePageProps<{ slug: string }>;

export const generateMetadata = withPageLocaleMetadata<CollectionPageProps>(async ({ params, locale }) => {
  const { slug } = params;
  const collection = await fetchCollectionDetail(slug);

  return buildPageMetadata({
    locale,
    pathname: `/collections/${slug}`,
    title: collection.name ?? collection.slug,
    description: collection.description,
  });
});

async function CollectionPage({ params }: WithPageLocaleProps<CollectionPageProps>) {
  const { slug } = params;
  const queryClient = getQueryClient();

  await runPrefetchSafe(async () => {
    const collection = await queryClient.fetchQuery(collectionsQueries.detail(slug));
    const listParams = {
      ...DEFAULT_CATALOG_FILTER_PARAMS,
      page: 1,
      limit: 48,
      collection: collection.code,
    };

    await queryClient.prefetchQuery(productsQueries.list(listParams));
  });

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <CollectionScreen slug={slug} />
    </QueryHydrate>
  );
}

export default withPageLocale(CollectionPage);
