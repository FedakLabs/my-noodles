import {
  type Collection,
  type PaginatedCollectionsDto,
  collectionsControllerList,
} from '@my-noodles/api-clients/storefront';
import { pagePaginatedGetNextPageParam } from '@my-noodles/web-lib/react-query';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export type CollectionsListParams = {
  page: number;
  limit: number;
};

export type CollectionsInfiniteListParams = {
  limit: number;
};

/** Default page size for the collections accordion list (products embedded per row). */
export const COLLECTIONS_PAGE_LIMIT = 10;

export const collectionsQueries = {
  rootKey: ['collections'] as const,
  /** Locale-prefixed root — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => collectionsQueries.rootKey)(),
    }),
  list: (params: CollectionsListParams) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...collectionsQueries.rootKey, 'list', params] as const)(),
      queryFn: () => collectionsControllerList({ query: params }),
    }),
  infiniteList: (params: CollectionsInfiniteListParams) =>
    infiniteQueryOptions({
      queryKey: withAppLocaleKey(() => [...collectionsQueries.rootKey, 'infiniteList', params] as const)(),
      queryFn: ({ pageParam }) =>
        collectionsControllerList({ query: { page: pageParam, limit: params.limit } }),
      initialPageParam: 1,
      getNextPageParam: pagePaginatedGetNextPageParam<Collection>(),
    }),
};

export type { PaginatedCollectionsDto };
