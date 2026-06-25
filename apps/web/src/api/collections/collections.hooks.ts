'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { collectionsQueryKeys, fetchCollectionDetail, fetchCollections } from './collections';

export function useCollections() {
  return formatUseQuery(
    useQuery({
      queryKey: collectionsQueryKeys.list(),
      queryFn: () => fetchCollections(),
    }),
    'collections',
  );
}

export function useCollectionDetail(slug: string) {
  return formatUseQuery(
    useQuery({
      queryKey: collectionsQueryKeys.detail(slug),
      queryFn: () => fetchCollectionDetail(slug),
    }),
    'collection',
  );
}
