'use client';

import type { Collection, PaginatedCollectionsDto } from '@my-noodles/api-clients/storefront';
import { formatUseInfiniteQuery, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  type CollectionsInfiniteListParams,
  type CollectionsListParams,
  COLLECTIONS_PAGE_LIMIT,
  collectionsQueries,
} from './collections';

export function useCollections(params: CollectionsListParams) {
  return formatUseQuery(useQuery(collectionsQueries.list(params)), 'collections');
}

export function useCollectionsInfiniteList(params?: CollectionsInfiniteListParams) {
  const listParams = params ?? { limit: COLLECTIONS_PAGE_LIMIT };

  return formatUseInfiniteQuery<PaginatedCollectionsDto, Collection, Error, 'collections'>(
    useInfiniteQuery(collectionsQueries.infiniteList(listParams)),
    'collections',
  );
}
