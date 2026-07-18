'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { collectionsQueries } from './collections';

export function useCollections() {
  return formatUseQuery(useQuery(collectionsQueries.list()), 'collections');
}

export function useCollectionDetail(slug: string) {
  return formatUseQuery(useQuery(collectionsQueries.detail(slug)), 'collection');
}
