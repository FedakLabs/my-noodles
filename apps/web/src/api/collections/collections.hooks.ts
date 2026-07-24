'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { collectionsQueries } from './collections';

export function useCollections(params?: { limit?: number }) {
  return formatUseQuery(useQuery(collectionsQueries.list(params?.limit)), 'collections');
}

export function useCollectionDetail(slug: string) {
  return formatUseQuery(useQuery(collectionsQueries.detail(slug)), 'collection');
}
