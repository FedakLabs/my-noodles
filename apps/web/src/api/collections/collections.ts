import {
  type Collection,
  collectionsControllerGetBySlug,
  collectionsControllerList,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';
import { queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

const collectionsQueryKeyRoot = ['collections'] as const;

export const collectionsQueryKeys = {
  all: collectionsQueryKeyRoot,
  list: withAppLocaleKey(() => [...collectionsQueryKeyRoot, 'list'] as const),
  detail: withAppLocaleKey((slug: string) => [...collectionsQueryKeyRoot, 'detail', slug] as const),
};

export async function fetchCollections(): Promise<Collection[]> {
  return await requestData(collectionsControllerList());
}

export async function fetchCollectionDetail(slug: string): Promise<Collection> {
  return await requestData(
    collectionsControllerGetBySlug({
      path: { slug },
    }),
  );
}

export const collectionsQueries = {
  list: () =>
    queryOptions({
      queryKey: collectionsQueryKeys.list(),
      queryFn: () => fetchCollections(),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: collectionsQueryKeys.detail(slug),
      queryFn: () => fetchCollectionDetail(slug),
    }),
};
